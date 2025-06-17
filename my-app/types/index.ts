// Global type definitions for the Cash Splitter app

// ===== RECEIPT ITEM TYPES =====
// Base interface for receipt items as returned by LLM
export interface LLMReceiptItem {
  itemName: string;
  itemPrice: number;
  quantity?: number;
}

// Internal receipt item used by ReceiptContext
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Receipt item with selection state for UI components
export interface ContextReceiptItem extends ReceiptItem {
  selected: boolean;
  assignedTo: string[];
}

// ===== RECEIPT DATA TYPES =====
export interface ParsedReceiptData {
  items: LLMReceiptItem[];
  total: number;
  tax?: number;
  service?: number | string;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedReceiptData;
  error?: string;
}

// ===== BILL SPLITTING TYPES =====
export interface PersonSummary {
  name: string;
  amount: number;
  items: string[];
}

// ===== CAMERA TYPES =====
export interface CameraError {
  code: string;
  message: string;
  recoverable: boolean;
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ===== NAVIGATION TYPES =====
export interface PreviewScreenParams {
  imageUri: string;
}

export interface CameraScreenParams {
  retryCount?: number;
}

// ===== UI COMPONENT TYPES =====
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

// ===== THEME TYPES =====
export type ColorScheme = "light" | "dark" | null;
export type ThemeColors = {
  light: string;
  dark: string;
};
