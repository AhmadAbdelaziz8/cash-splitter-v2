import React, { createContext, useContext, useState, ReactNode } from "react";

// Define interface for receipt items
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

// Define the context state interface
interface ReceiptContextType {
  imageUri: string | null;
  parsedItems: ReceiptItem[] | null;
  isLoading: boolean;
  error: string | null;
  shareableLink: string | null;
  setImageUri: (uri: string | null) => void;
  setParsedItems: (items: ReceiptItem[] | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  generateShareableLink: () => void;
  clearState: () => void;
}

// Create context with default values
const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

// Provider component
export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ReceiptItem[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  // Generate a shareable link from parsed items
  const generateShareableLink = () => {
    if (!parsedItems) {
      setError("No receipt items to share");
      return;
    }

    try {
      const encodedData = encodeURIComponent(JSON.stringify(parsedItems));
      const link = `https://your-static-site.com/splitter.html#data=${encodedData}`;
      setShareableLink(link);
    } catch (error) {
      setError("Failed to generate shareable link");
    }
  };

  // Clear all state
  const clearState = () => {
    setImageUri(null);
    setParsedItems(null);
    setLoading(false);
    setError(null);
    setShareableLink(null);
  };

  return (
    <ReceiptContext.Provider
      value={{
        imageUri,
        parsedItems,
        isLoading,
        error,
        shareableLink,
        setImageUri,
        setParsedItems,
        setLoading,
        setError,
        generateShareableLink,
        clearState,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

// Custom hook to use the context
export function useReceipt() {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error("useReceipt must be used within a ReceiptProvider");
  }
  return context;
}
