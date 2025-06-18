import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { WEB_SHARING } from "@/constants/AppConstants"; // Import WEB_SHARING
import {
  ParsedReceiptData as GeminiParsedReceiptData,
  ReceiptItem as GeminiReceiptItem,
  ReceiptParsingError,
} from "@/config/geminiConfig"; // For type clarity
import { receiptService as apiReceiptService } from "@/services/receiptService"; // Aliased import
import { ReceiptItem, LLMReceiptItem } from "@/types";

// Define interface for receipt items (now includes quantity)
export { ReceiptItem } from "@/types";

// Define the context state interface
interface ReceiptContextType {
  imageUri: string | null;
  imageBase64: string | null;
  items: ReceiptItem[];
  receiptTotal: number; // This will now be the dynamically calculated grand total
  receiptTax: number | null;
  serviceChargeValue: number | string | null; // Renamed from receiptService
  originalReceiptTotal: number | null; // Store the total as parsed from the receipt by LLM
  shareableLink: string | null;
  isProcessing: boolean; // New state
  processingError: string | null; // New state
  processingErrorType: ReceiptParsingError | null; // New state for error type
  setImageUri: (uri: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  // setItems: (items: ReceiptItem[]) => void; // Replaced by setProcessedReceiptData for initial load
  setProcessedReceiptData: (data: GeminiParsedReceiptData) => void; // New function for initial LLM data
  addItem: (
    item: Omit<ReceiptItem, "id" | "quantity"> & { quantity?: number }
  ) => void; // Allow optional quantity, defaults to 1
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  deleteItem: (id: string) => void;
  updateReceiptTax: (newTax: number | null) => void; // New mutator
  updateServiceChargeValue: (newService: number | string | null) => void; // Renamed from updateReceiptService
  generateShareableLink: () => void;
  processReceiptImage: (imageBase64: string) => Promise<void>; // New async function
  setProcessingError: (
    error: string | null,
    errorType?: ReceiptParsingError | null
  ) => void; // Updated function
  resetState: () => void;
}

// Create context with default values
const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

// Provider component
export const ReceiptProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [receiptTax, setReceiptTax] = useState<number | null>(null);
  const [serviceChargeValue, setServiceChargeValue] = useState<
    number | string | null
  >(null);
  const [originalReceiptTotal, setOriginalReceiptTotal] = useState<
    number | null
  >(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingErrorType, setProcessingErrorType] =
    useState<ReceiptParsingError | null>(null);

  const setProcessedReceiptData = (data: GeminiParsedReceiptData) => {
    const processedItems: ReceiptItem[] = data.items.map((item, index) => ({
      id: `item_${Date.now()}_${index}`,
      name: item.itemName,
      price: item.itemPrice,
      quantity: item.quantity ?? 1,
    }));

    setItems(processedItems);
    setOriginalReceiptTotal(data.total);
    setReceiptTax(data.tax ?? null);
    setServiceChargeValue(data.service ?? null);
  };

  const processReceiptImage = async (imgBase64: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingErrorType(null);

    try {
      const result = await apiReceiptService.parseReceiptImage(imgBase64);

      if (result.success && result.data) {
        setProcessedReceiptData(result.data);
      } else {
        const errorMessage = result.error || "Failed to process receipt image.";
        const errorType = result.errorType || null;
        setProcessingError(errorMessage);
        setProcessingErrorType(errorType);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing the receipt.";
      // If we don't already have an error type from the service, set a generic one
      if (!processingErrorType) {
        setProcessingErrorType(ReceiptParsingError.UNREADABLE_IMAGE);
      }
      setProcessingError(errorMessage);
      throw error; // Re-throw so calling code can handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const addItem = (
    item: Omit<ReceiptItem, "id" | "quantity"> & { quantity?: number }
  ) => {
    const newItem: ReceiptItem = {
      id: `item_${Date.now()}`,
      ...item,
      quantity: item.quantity ?? 1,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (
    id: string,
    updates: Partial<Omit<ReceiptItem, "id">>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateReceiptTax = (newTax: number | null) => {
    setReceiptTax(newTax);
  };

  const updateServiceChargeValue = (newService: number | string | null) => {
    setServiceChargeValue(newService);
  };

  // Calculate subtotal based on all items
  const itemsSubtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate service charge amount
  const serviceChargeAmount = (() => {
    if (serviceChargeValue === null) return 0;
    if (typeof serviceChargeValue === "string") {
      // Handle percentage service charge
      const percentage = parseFloat(serviceChargeValue.replace("%", ""));
      return isNaN(percentage) ? 0 : (itemsSubtotal * percentage) / 100;
    }
    // Handle fixed service charge
    return serviceChargeValue;
  })();

  // Calculate grand total
  const receiptTotal = itemsSubtotal + (receiptTax ?? 0) + serviceChargeAmount;

  const generateShareableLink = () => {
    // Include ALL items in the shareable link
    if (items.length === 0) {
      setShareableLink(null);
      return;
    }

    const shareData = {
      items: items, // Send ALL items
      subtotal: itemsSubtotal, // Total of all items
      tax: receiptTax,
      service: serviceChargeValue,
      total: receiptTotal, // Grand total including all items
    };

    try {
      const encodedData = encodeURIComponent(JSON.stringify(shareData));
      const shareUrl = `${WEB_SHARING.BASE_URL}#data=${encodedData}`;
      setShareableLink(shareUrl);
    } catch (error) {
      if (__DEV__) {
        console.error("Error generating shareable link:", error);
      }
      setShareableLink(null);
    }
  };

  const resetState = () => {
    setImageUri(null);
    setImageBase64(null);
    setItems([]);
    setReceiptTax(null);
    setServiceChargeValue(null);
    setOriginalReceiptTotal(null);
    setShareableLink(null);
    setIsProcessing(false);
    setProcessingError(null);
    setProcessingErrorType(null);
  };

  const handleSetProcessingError = (
    error: string | null,
    errorType?: ReceiptParsingError | null
  ) => {
    setProcessingError(error);
    setProcessingErrorType(errorType || null);
  };

  return (
    <ReceiptContext.Provider
      value={{
        imageUri,
        imageBase64,
        items,
        receiptTotal,
        receiptTax,
        serviceChargeValue,
        originalReceiptTotal,
        shareableLink,
        isProcessing,
        processingError,
        processingErrorType,
        setImageUri,
        setImageBase64,
        setProcessedReceiptData,
        addItem,
        updateItem,
        deleteItem,
        updateReceiptTax,
        updateServiceChargeValue,
        generateShareableLink,
        processReceiptImage,
        setProcessingError: handleSetProcessingError,
        resetState,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
};

// Custom hook to use the context
export const useReceipt = () => {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error("useReceipt must be used within a ReceiptProvider");
  }
  return context;
};
