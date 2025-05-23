import React, { createContext, useState, useContext, ReactNode } from "react";

// Define interface for receipt items
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
  assignedTo: string[];
}

// Define the context state interface
interface ReceiptContextType {
  imageUri: string | null;
  imageBase64: string | null;
  items: ReceiptItem[];
  setImageUri: (uri: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  setItems: (items: ReceiptItem[]) => void;
  resetState: () => void;
}

// Create context with default values
const initialReceiptItems: ReceiptItem[] = [
  { id: "1", name: "Burger", price: 10.99, selected: false, assignedTo: [] },
  { id: "2", name: "Fries", price: 3.5, selected: false, assignedTo: [] },
  { id: "3", name: "Soda", price: 2.5, selected: false, assignedTo: [] },
  { id: "4", name: "Ice Cream", price: 4.99, selected: false, assignedTo: [] },
  { id: "5", name: "Coffee", price: 3.99, selected: false, assignedTo: [] },
];

const ReceiptContext = createContext<ReceiptContextType>({
  imageUri: null,
  imageBase64: null,
  items: initialReceiptItems,
  setImageUri: () => {},
  setImageBase64: () => {},
  setItems: () => {},
  resetState: () => {},
});

// Provider component
export const ReceiptProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>(initialReceiptItems);

  // Clear all state
  const resetState = () => {
    setImageUri(null);
    setImageBase64(null);
    setItems(initialReceiptItems);
  };

  return (
    <ReceiptContext.Provider
      value={{
        imageUri,
        imageBase64,
        items,
        setImageUri,
        setImageBase64,
        setItems,
        resetState,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
};

// Custom hook to use the context
export const useReceipt = () => useContext(ReceiptContext);
