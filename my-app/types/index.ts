// Global type definitions for the Cash Splitter app

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
  assignedTo: string[];
}

export interface ParsedReceiptData {
  items: ReceiptItem[];
  total: number;
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
