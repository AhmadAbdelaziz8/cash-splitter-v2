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
} from "@/config/geminiConfig"; // For type clarity

// Define interface for receipt items (now includes quantity)
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number; // Added quantity
}

// Define the context state interface
interface ReceiptContextType {
  imageUri: string | null;
  imageBase64: string | null;
  items: ReceiptItem[];
  receiptTotal: number; // This will now be the dynamically calculated grand total
  receiptTax: number | null;
  receiptService: number | string | null; // Updated type
  originalReceiptTotal: number | null; // Store the total as parsed from the receipt by LLM
  userSelectedItemIds: string[];
  userSubtotal: number;
  shareableLink: string | null;
  setImageUri: (uri: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  // setItems: (items: ReceiptItem[]) => void; // Replaced by setProcessedReceiptData for initial load
  setProcessedReceiptData: (data: GeminiParsedReceiptData) => void; // New function for initial LLM data
  addItem: (
    item: Omit<ReceiptItem, "id" | "quantity"> & { quantity?: number }
  ) => void; // Allow optional quantity, defaults to 1
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  deleteItem: (id: string) => void;
  toggleUserItemSelection: (id: string) => void;
  updateReceiptTax: (newTax: number | null) => void; // New mutator
  updateReceiptService: (newService: number | string | null) => void; // New mutator
  generateShareableLink: () => void;
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
  const [receiptTotal, setReceiptTotal] = useState<number>(0); // Dynamically calculated
  const [originalReceiptTotal, setOriginalReceiptTotal] = useState<
    number | null
  >(null); // From LLM
  const [receiptTax, setReceiptTax] = useState<number | null>(null);
  const [receiptService, setReceiptService] = useState<number | string | null>(
    null
  ); // Updated type
  const [userSelectedItemIds, setUserSelectedItemIds] = useState<string[]>([]);
  const [userSubtotal, setUserSubtotal] = useState<number>(0);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  const setProcessedReceiptData = (data: GeminiParsedReceiptData) => {
    const newItems = data.items.map((item: GeminiReceiptItem) => ({
      ...item, // spread itemName, itemPrice, quantity from GeminiReceiptItem
      name: item.itemName, // Map itemName to name
      price: item.itemPrice, // Map itemPrice to price
      id: `item-${Date.now()}-${Math.random()}-${item.itemName}`,
      quantity: item.quantity || 1, // Already defaulted in geminiConfig, but good fallback
    }));
    setItems(newItems);
    setOriginalReceiptTotal(data.total ?? null); // Store the LLM provided total
    setReceiptTax(data.tax ?? null);
    // For service, if it's a number string from LLM (but not percentage), geminiConfig validation might have converted it.
    // If it's a percentage string (e.g., "10%"), it remains a string.
    setReceiptService(data.service ?? null);
    setUserSelectedItemIds([]); // Clear selections when new receipt is processed
  };

  const addItem = (
    item: Omit<ReceiptItem, "id" | "quantity"> & { quantity?: number }
  ) => {
    const newItem: ReceiptItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random()}`,
      quantity: item.quantity || 1, // Default quantity to 1 if not provided
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const updateItem = (
    id: string,
    updates: Partial<Omit<ReceiptItem, "id">>
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setUserSelectedItemIds((prevIds) =>
      prevIds.filter((itemId) => itemId !== id)
    );
  };

  const toggleUserItemSelection = (id: string) => {
    setUserSelectedItemIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((itemId) => itemId !== id)
        : [...prevIds, id]
    );
  };

  const updateReceiptTax = (newTax: number | null) => {
    setReceiptTax(newTax);
  };

  const updateReceiptService = (newService: number | string | null) => {
    setReceiptService(newService);
  };

  // Effect to calculate user subtotal
  useEffect(() => {
    const subtotal = items.reduce((acc, item) => {
      if (userSelectedItemIds.includes(item.id)) {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);
    setUserSubtotal(subtotal);
  }, [items, userSelectedItemIds]);

  // Effect to calculate grand total based on items, tax, and service
  useEffect(() => {
    const itemsSubtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const currentTax = receiptTax ?? 0;
    let currentServiceAmount = 0;

    if (typeof receiptService === "number") {
      currentServiceAmount = receiptService;
    } else if (typeof receiptService === "string") {
      const percentageMatch = receiptService.match(/^(\d*\.?\d+)%$/);
      if (percentageMatch && percentageMatch[1]) {
        const percentage = parseFloat(percentageMatch[1]);
        if (!isNaN(percentage)) {
          currentServiceAmount = (percentage / 100) * itemsSubtotal;
        }
      }
    }
    setReceiptTotal(itemsSubtotal + currentTax + currentServiceAmount);
  }, [items, receiptTax, receiptService]);

  const generateShareableLink = () => {
    const staticSiteBaseUrl = WEB_SHARING.BASE_URL;
    // Include quantity in shared items. Consider adding tax/service/total if needed for the static page.
    const itemsForLink = items.map(({ name, price, quantity }) => ({
      name,
      price,
      quantity,
    }));
    const shareData = {
      items: itemsForLink,
      total: receiptTotal, // This is now the calculated total
      tax: receiptTax,
      service: receiptService, // Share service as number or string "10%"
      originalTotal: originalReceiptTotal, // Optionally share the original parsed total
    };
    const dataString = JSON.stringify(shareData);
    const encodedData = encodeURIComponent(dataString);
    const link = `${staticSiteBaseUrl}#data=${encodedData}`;
    setShareableLink(link);
  };

  const resetState = () => {
    setImageUri(null);
    setImageBase64(null);
    setItems([]);
    setReceiptTotal(0);
    setOriginalReceiptTotal(null);
    setReceiptTax(null);
    setReceiptService(null);
    setUserSelectedItemIds([]);
    setShareableLink(null);
  };

  return (
    <ReceiptContext.Provider
      value={{
        imageUri,
        imageBase64,
        items,
        receiptTotal, // Calculated grand total
        receiptTax,
        receiptService,
        originalReceiptTotal, // LLM parsed total
        userSelectedItemIds,
        userSubtotal,
        shareableLink,
        setImageUri,
        setImageBase64,
        setProcessedReceiptData, // Changed from setItems
        addItem,
        updateItem,
        deleteItem,
        toggleUserItemSelection,
        updateReceiptTax,
        updateReceiptService,
        generateShareableLink,
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
