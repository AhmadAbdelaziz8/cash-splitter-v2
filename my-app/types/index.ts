// Global type definitions for the Cash Splitter app

// This is what the ReceiptContext uses internally after processing
export interface ContextReceiptItem {
  id: string;
  name: string; // Mapped from itemName
  price: number; // Mapped from itemPrice
  quantity: number; // Added
  selected: boolean;
  assignedTo: string[];
}

// This is what the LLM service is expected to parse and return
// It matches ParsedReceiptDataByLLM in receiptService.ts and GeminiParsedReceiptData in ReceiptContext
export interface LLMReceiptItem {
  itemName: string;
  itemPrice: number;
  quantity?: number;
}

export interface ParsedReceiptData {
  items: LLMReceiptItem[]; // Uses the LLM item structure
  total: number;
  tax?: number; // Added optional tax
  service?: number; // Added optional service
}

export interface ParseResult {
  success: boolean;
  data?: ParsedReceiptData;
  error?: string;
}

export interface PersonSummary {
  name: string;
  amount: number;
  items: string[];
}

// Camera related types
export interface CameraError {
  code: string;
  message: string;
  recoverable: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Navigation parameter types
export interface PreviewScreenParams {
  imageUri: string;
}

export interface CameraScreenParams {
  retryCount?: number;
}
