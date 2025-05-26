import { Alert, Platform } from "react-native";
import { CameraError } from "@/types";

export enum ErrorType {
  CAMERA = "camera",
  PERMISSION = "permission",
  API = "api",
  NETWORK = "network",
  VALIDATION = "validation",
  SHARING = "sharing",
  UNKNOWN = "unknown",
}

export interface ErrorReport {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: string;
  timestamp: number;
}

class ErrorHandler {
  private errors: ErrorReport[] = [];

  logError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: string
  ): ErrorReport {
    const errorReport: ErrorReport = {
      type,
      message,
      originalError,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorReport);

    // Only log in development
    if (__DEV__) {
      console.error(`[${type.toUpperCase()}] ${message}`, {
        context,
        originalError,
      });
    }

    return errorReport;
  }

  showUserError(
    title: string,
    message: string,
    actions?: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ): void {
    const defaultActions = [{ text: "OK", style: "default" as const }];
    Alert.alert(title, message, actions || defaultActions);
  }

  getCameraErrorMessage(error: unknown): CameraError {
    const errorString = error instanceof Error ? error.message : String(error);

    if (errorString.includes("Camera is not running")) {
      return {
        code: "CAMERA_NOT_RUNNING",
        message: "Camera is not active. Please restart the camera.",
        recoverable: true,
      };
    }

    if (errorString.includes("permission")) {
      return {
        code: "PERMISSION_DENIED",
        message: "Camera permission issue. Please check app permissions.",
        recoverable: true,
      };
    }

    if (errorString.includes("storage") || errorString.includes("disk")) {
      return {
        code: "STORAGE_FULL",
        message: "Not enough storage space to save the photo.",
        recoverable: false,
      };
    }

    return {
      code: "UNKNOWN",
      message: errorString || "Unknown camera error occurred",
      recoverable: false,
    };
  }

  getErrorHistory(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandler = new ErrorHandler();

// Helper functions for common error scenarios
export const handleCameraError = (error: unknown, context?: string) => {
  const cameraError = errorHandler.getCameraErrorMessage(error);
  return errorHandler.logError(
    ErrorType.CAMERA,
    cameraError.message,
    error instanceof Error ? error : undefined,
    context
  );
};

export const handleApiError = (error: unknown, context?: string) => {
  const message = error instanceof Error ? error.message : "Unknown API error";
  return errorHandler.logError(
    ErrorType.API,
    message,
    error instanceof Error ? error : undefined,
    context
  );
};

export const handlePermissionError = (permission: string, context?: string) => {
  const message = `${permission} permission denied`;
  return errorHandler.logError(
    ErrorType.PERMISSION,
    message,
    undefined,
    context
  );
};
