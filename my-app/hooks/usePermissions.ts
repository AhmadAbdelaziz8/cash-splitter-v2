import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { errorHandler, ErrorType } from "@/utils/errorUtils";

export interface PermissionState {
  camera: boolean;
  mediaLibrary: boolean;
  isLoading: boolean;
}

export interface PermissionActions {
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  openSettings: () => void;
}

export const usePermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [permissionState, setPermissionState] = useState<PermissionState>({
    camera: false,
    mediaLibrary: false,
    isLoading: true,
  });

  useEffect(() => {
    setPermissionState({
      camera: cameraPermission?.granted || false,
      mediaLibrary: false, // Will be checked when needed
      isLoading: !cameraPermission,
    });
  }, [cameraPermission]);

  const requestCamera = async (): Promise<boolean> => {
    try {
      // Additional safety check for Samsung devices
      if (!cameraPermission) {
        console.warn("Camera permission object not available");
        return false;
      }

      const result = await requestCameraPermission();

      if (!result.granted) {
        // More gentle error handling - no immediate alerts
        console.warn("Camera permission not granted");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Camera permission error:", error);
      // Don't crash the app, just log and return false
      return false;
    }
  };

  const requestMediaLibrary = async (): Promise<boolean> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        errorHandler.showUserError(
          "Permission Required",
          "We need access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      setPermissionState((prev) => ({ ...prev, mediaLibrary: true }));
      return true;
    } catch (error) {
      errorHandler.logError(
        ErrorType.PERMISSION,
        "Failed to request media library permission",
        error instanceof Error ? error : undefined,
        "usePermissions.requestMediaLibrary"
      );
      return false;
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const actions: PermissionActions = {
    requestCameraPermission: requestCamera,
    requestMediaLibraryPermission: requestMediaLibrary,
    openSettings,
  };

  return {
    permissions: permissionState,
    actions,
    // For backward compatibility
    cameraPermission,
  };
};
