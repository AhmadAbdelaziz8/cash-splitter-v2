// App-wide constants for the Cash Splitter app

export const TIMING = {
  PROCESSING_STEP_DELAY: 800,
  PROCESSING_START_DELAY: 1000,
  RESULTS_NAVIGATION_DELAY: 500,
  CAMERA_READY_DELAY: 100,
} as const;

export const CAMERA = {
  QUALITY: 0.7,
  ICON_SIZE: 28,
  CAPTURE_BUTTON_SIZE: 64,
  CAPTURE_BUTTON_RADIUS: 32,
} as const;

export const IMAGES = {
  QUALITY: 0.8,
  ASPECT_RATIO: [4, 3] as const,
  HEIGHT: 320, // h-80 in Tailwind
} as const;

export const COLORS = {
  GRAY_800: "#374151",
  SKY_500: "#0ea5e9",
  SKY_400: "#38bdf8",
  WHITE: "#ffffff",
} as const;

export const MESSAGES = {
  CAMERA_PERMISSION:
    "Allow Cash Splitter to access your camera to scan receipts",
  GALLERY_PERMISSION:
    "Allow Cash Splitter to access your photo library to select receipt images",
  NO_API_KEY:
    "Google API Key not found. Please set your API key in the app settings.",
  PROCESSING_STEPS: [
    "Analyzing receipt...",
    "Identifying items...",
    "Calculating totals...",
    "Preparing results...",
  ],
  WEB_URL_GENERATED: "Web link created! Share with your friends.",
  WEB_URL_ERROR: "Failed to create web link. Using fallback sharing.",
  WEB_URL_TOO_LONG: "Receipt data too large for URL. Using summary sharing.",

  // Error Messages
  ERRORS: {
    NETWORK: "Network error. Please check your connection and try again.",
    TIMEOUT: "Request timed out. Please try again.",
    INVALID_API_KEY: "Invalid API key. Please check your settings.",
    PROCESSING_FAILED: "Failed to process receipt. Please try again.",
    CAMERA_ERROR: "Camera error occurred. Please try again.",
    PERMISSION_DENIED:
      "Permission denied. Please enable permissions in settings.",
  },

  // Success Messages
  SUCCESS: {
    API_KEY_SAVED: "API key saved successfully!",
    RECEIPT_PROCESSED: "Receipt processed successfully!",
    ITEM_ADDED: "Item added successfully!",
    ITEM_UPDATED: "Item updated successfully!",
    ITEM_DELETED: "Item deleted successfully!",
  },
} as const;

export const API = {
  GEMINI_MODEL: "gemini-2.5-flash-preview-05-20",
  DEFAULT_MIME_TYPE: "image/jpeg",
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
} as const;

export const WEB_SHARING = {
  BASE_URL: "https://cash-splitter-static.vercel.app/",
  MAX_URL_LENGTH: 2048,
  FALLBACK_SHARE_MESSAGE: "Check out this bill split calculation!",
} as const;

// UI Constants
export const UI = {
  COLORS: {
    PRIMARY: "#3b82f6",
    SECONDARY: "#64748b",
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    ERROR: "#ef4444",
    SURFACE: "#f8fafc",
    SURFACE_DARK: "#0f172a",
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BORDER_RADIUS: {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
  },
} as const;

// Animation Constants
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: "ease-in",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
  },
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  ENABLE_DEBUG_LOGS: __DEV__,
  ENABLE_MOCK_DATA: false,
} as const;

// App Configuration
export const APP_CONFIG = {
  VERSION: "2.0.0",
  BUILD_NUMBER: 1,
  MIN_ANDROID_VERSION: 21,
  MIN_IOS_VERSION: "13.0",
  SUPPORTED_IMAGE_FORMATS: ["jpg", "jpeg", "png", "webp"],
  MAX_IMAGE_SIZE_MB: 10,
} as const;
