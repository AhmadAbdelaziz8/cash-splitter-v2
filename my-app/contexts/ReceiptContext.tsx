import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { WEB_SHARING } from "@/constants/AppConstants"; // Import WEB_SHARING

// Define interface for receipt items
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

// Define the context state interface
interface ReceiptContextType {
  imageUri: string | null;
  imageBase64: string | null;
  items: ReceiptItem[];
  userSelectedItemIds: string[];
  userSubtotal: number;
  shareableLink: string | null; // Added for the generated link
  setImageUri: (uri: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  setItems: (items: ReceiptItem[]) => void; // For initial LLM parsed items
  addItem: (item: Omit<ReceiptItem, "id">) => void;
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  deleteItem: (id: string) => void;
  toggleUserItemSelection: (id: string) => void;
  generateShareableLink: () => void; // Action to generate the link
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
  const [userSelectedItemIds, setUserSelectedItemIds] = useState<string[]>([]);
  const [userSubtotal, setUserSubtotal] = useState<number>(0);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  // Function to add an item
  const addItem = (item: Omit<ReceiptItem, "id">) => {
    const newItem: ReceiptItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random()}`,
    }; // Simple unique ID
    setItems((prevItems) => [...prevItems, newItem]);
  };

  // Function to update an item
  const updateItem = (
    id: string,
    updates: Partial<Omit<ReceiptItem, "id">>
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Function to delete an item
  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setUserSelectedItemIds((prevIds) =>
      prevIds.filter((itemId) => itemId !== id)
    ); // Also remove from selection
  };

  // Function to toggle user's item selection
  const toggleUserItemSelection = (id: string) => {
    setUserSelectedItemIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((itemId) => itemId !== id)
        : [...prevIds, id]
    );
  };

  // Effect to calculate user subtotal
  useEffect(() => {
    const subtotal = items.reduce((acc, item) => {
      if (userSelectedItemIds.includes(item.id)) {
        return acc + item.price;
      }
      return acc;
    }, 0);
    setUserSubtotal(subtotal);
  }, [items, userSelectedItemIds]);

  // Function to generate shareable link
  const generateShareableLink = () => {
    // Use WEB_SHARING.BASE_URL from AppConstants
    const staticSiteBaseUrl = WEB_SHARING.BASE_URL;

    // We only need item names and prices for the link, not IDs or other app-specific state
    const itemsForLink = items.map(({ name, price }) => ({ name, price }));

    const dataString = JSON.stringify(itemsForLink);
    const encodedData = encodeURIComponent(dataString);
    // Use #data= structure as per original plan
    const link = `${staticSiteBaseUrl}#data=${encodedData}`;
    setShareableLink(link);
  };

  // Clear all state
  const resetState = () => {
    setImageUri(null);
    setImageBase64(null);
    setItems([]);
    setUserSelectedItemIds([]);
    // userSubtotal will be reset by useEffect
    setShareableLink(null);
  };

  return (
    <ReceiptContext.Provider
      value={{
        imageUri,
        imageBase64,
        items,
        userSelectedItemIds,
        userSubtotal,
        shareableLink,
        setImageUri,
        setImageBase64,
        setItems,
        addItem,
        updateItem,
        deleteItem,
        toggleUserItemSelection,
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
