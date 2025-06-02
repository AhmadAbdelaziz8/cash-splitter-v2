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
} as const;

export const API = {
  GEMINI_MODEL: "gemini-2.5-flash-preview-05-20",
  DEFAULT_MIME_TYPE: "image/jpeg",
} as const;

export const WEB_SHARING = {
  BASE_URL: "https://yoursite.com",
  MAX_URL_LENGTH: 2048, // Browser URL length limit
  FALLBACK_SHARE_MESSAGE: "Check out this bill split calculation!",
} as const;
