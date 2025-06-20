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
  // Image data
  imageUri: string | null;
  imageBase64: string | null;
  setImageData: (uri: string, base64: string) => void;

  // Receipt items and totals
  items: ReceiptItem[];
  itemsSubtotal: number; // Sum of all items
  receiptTax: string | null; // Always percentage string like "14%"
  serviceChargeValue: number | null; // Always fixed number for equal distribution
  originalReceiptTotal: number | null;
  receiptTotal: number; // Calculated total including tax and service
  shareableLink: string | null;

  // Processing state
  isProcessing: boolean;
  processingError: string | null;
  processingErrorType: ReceiptParsingError | null;

  // Actions
  addItem: (item: Omit<ReceiptItem, "id">) => void;
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  deleteItem: (id: string) => void;
  updateReceiptTax: (newTax: string | null) => void; // Always percentage string
  updateServiceChargeValue: (newService: number | null) => void; // Always fixed number
  parseReceipt: () => Promise<void>;
  generateShareableLink: () => void;
  resetState: () => void;
  setProcessingError: (
    error: string | null,
    errorType?: ReceiptParsingError | null
  ) => void;
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
  const [receiptTax, setReceiptTax] = useState<string | null>(null);
  const [serviceChargeValue, setServiceChargeValue] = useState<number | null>(
    null
  );
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

    // Calculate subtotal to help normalize tax
    const subtotal = processedItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Normalize tax - prefer percentage when appropriate
    let finalTax = normalizeTax(data.tax, subtotal);

    setItems(processedItems);
    setOriginalReceiptTotal(data.total);
    setReceiptTax(finalTax);
    setServiceChargeValue(data.service ?? null);
  };

  // Helper function to normalize tax (convert fixed amounts to percentage when appropriate)
  const normalizeTax = (
    taxValue: number | string | null | undefined,
    subtotal: number
  ): string | number | null => {
    if (taxValue === null || taxValue === undefined) {
      return "14%"; // Default to 14% percentage
    }

    if (typeof taxValue === "string" && taxValue.includes("%")) {
      return taxValue; // Already a percentage
    }

    if (typeof taxValue === "number" && subtotal > 0) {
      // Check common tax percentages with 3% tolerance
      const commonPercentages = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

      for (const percentage of commonPercentages) {
        const expectedAmount = (subtotal * percentage) / 100;
        const difference = Math.abs(taxValue - expectedAmount);
        const relativeError = difference / expectedAmount;

        if (relativeError <= 0.03) {
          return `${percentage}%`; // Convert to percentage
        }
      }

      // If it doesn't match any common percentage, keep as fixed amount
      return taxValue;
    }

    return "14%"; // Default fallback
  };

  const processReceiptImage = async (imageBase64: string): Promise<void> => {
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingErrorType(null);

    try {
      const result = await apiReceiptService.parseReceiptImage(imageBase64);

      if (result.success && result.data) {
        // Set parsed items
        const parsedItems: ReceiptItem[] = result.data.items.map(
          (item, index) => ({
            id: `item_${Date.now()}_${index}`,
            name: item.itemName,
            price: item.itemPrice,
            quantity: item.quantity || 1,
            assignedTo: [],
          })
        );

        setItems(parsedItems);
        setOriginalReceiptTotal(result.data.total);
        
        // Tax is only set if found on receipt (no default)
        if (result.data.tax) {
          setReceiptTax(result.data.tax);
        } else {
          setReceiptTax(null); // No tax found, don't default
        }
        
        // Service is only set if found on receipt
        setServiceChargeValue(result.data.service || null);
      } else {
        // Handle parsing errors
        const errorType = result.errorType || ReceiptParsingError.API_ERROR;
        setProcessingError(result.error || "Failed to parse receipt");
        setProcessingErrorType(errorType);
      }
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setProcessingErrorType(ReceiptParsingError.API_ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const addItem = (item: Omit<ReceiptItem, "id">) => {
    const newItem: ReceiptItem = {
      id: `item_${Date.now()}`,
      ...item,
      quantity: item.quantity ?? 1,
    };

    setItems((prev) => {
      const updatedItems = [...prev, newItem];

      // If this is the first item and no tax is set, set default 14% tax
      if (prev.length === 0 && receiptTax === null) {
        setReceiptTax("14%");
      }

      return updatedItems;
    });
  };

  const updateItem = (
    id: string,
    updates: Partial<Omit<ReceiptItem, "id">>
  ) => {
    setItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );

      // If tax is currently "14%", keep it as "14%"
      if (receiptTax === "14%") {
        setReceiptTax("14%");
      }

      return updatedItems;
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== id);

      // If tax is currently "14%", handle appropriately
      if (receiptTax === "14%") {
        if (updatedItems.length === 0) {
          // No items left, set tax to null
          setReceiptTax(null);
        } else {
          // Keep 14% tax rate
          setReceiptTax("14%");
        }
      }

      return updatedItems;
    });
  };

  const updateReceiptTax = (newTax: string | null) => {
    setReceiptTax(newTax);
  };

  const updateServiceChargeValue = (newService: number | null) => {
    setServiceChargeValue(newService);
  };

  // Calculate subtotal based on all items
  const itemsSubtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate tax amount
  const taxAmount = (() => {
    if (receiptTax === null) return 0;
    // Tax is always percentage string
    const percentage = parseFloat(receiptTax.replace("%", ""));
    return isNaN(percentage) ? 0 : (itemsSubtotal * percentage) / 100;
  })();

  // Calculate service charge amount (always fixed number)
  const serviceChargeAmount = (() => {
    if (serviceChargeValue === null) return 0;
    // Service is always fixed amount
    return serviceChargeValue;
  })();

  // Calculate grand total
  const receiptTotal = itemsSubtotal + taxAmount + serviceChargeAmount;

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
        itemsSubtotal,
        receiptTax,
        serviceChargeValue,
        originalReceiptTotal,
        receiptTotal,
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
        processReceiptImage,
        generateShareableLink,
        resetState,
        setProcessingError: handleSetProcessingError,
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
