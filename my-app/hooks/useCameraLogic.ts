import { useState, useRef, useEffect } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  CameraMountError,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useReceipt } from "@/contexts/ReceiptContext";

interface UseCameraLogicResult {
  cameraRef: React.RefObject<CameraView>;
  facing: CameraType;
  permission: ReturnType<typeof useCameraPermissions>[0];
  permissionStatus: string;
  isCameraReady: boolean;
  requestCameraPermission: () => Promise<void>;
  handleCameraReady: () => void;
  toggleCameraFacing: () => void;
  handleCapturePhoto: () => Promise<void>;
  handleSelectFromGallery: () => Promise<void>;
  handleCameraMountError: (error: CameraMountError) => void;
}

export function useCameraLogic(): UseCameraLogicResult {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { resetState } = useReceipt();

  const storeImageTemporarily =
    Platform.OS === "web"
      ? (uri: string) => Promise.resolve(uri)
      : async (originalUri: string): Promise<string> => {
          try {
            const imageDir = FileSystem.documentDirectory + "images/";
            await FileSystem.makeDirectoryAsync(imageDir, {
              intermediates: true,
            });
            const fileName = Date.now() + "_" + originalUri.split("/").pop();
            const newPersistentUri = imageDir + fileName;
            await FileSystem.copyAsync({
              from: originalUri,
              to: newPersistentUri,
            });
            console.log(
              "CAMERA_DEBUG: Image copied to persistent URI:",
              newPersistentUri
            );
            return newPersistentUri;
          } catch (e) {
            console.error(
              "CAMERA_DEBUG: Failed to copy image to persistent dir:",
              e
            );
            throw e;
          }
        };

  useEffect(() => {
    resetState();
    if (permission) {
      setPermissionStatus(permission.granted ? "granted" : "denied");
    }

    const checkAndRequestPermission = async () => {
      if (permission && !permission.granted) {
        await requestCameraPermission();
      }
    };

    checkAndRequestPermission();
  }, [permission]);

  const requestCameraPermission = async () => {
    try {
      const result = await requestPermission();
      setPermissionStatus(result.granted ? "granted" : "denied");

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "This app needs camera access to function properly. Please grant permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setPermissionStatus("error");
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapturePhoto = async () => {
    if (!isCameraReady) {
      Alert.alert(
        "Camera not ready",
        "Please wait for the camera to initialize"
      );
      return;
    }

    if (!cameraRef.current) {
      Alert.alert("Error", "Camera reference not available");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
        base64: false,
        exif: false,
      });

      if (photo?.uri) {
        try {
          const persistentUri = await storeImageTemporarily(photo.uri);
          console.log(
            "CAMERA_DEBUG: Navigating to preview with URI:",
            persistentUri
          );
          router.push({
            pathname: "/preview",
            params: { imageUri: persistentUri },
          });
        } catch (copyError) {
          Alert.alert(
            "Error",
            "Failed to save captured photo before previewing."
          );
        }
      } else {
        Alert.alert(
          "Error",
          "Failed to capture photo - no image data received"
        );
      }
    } catch (error) {
      console.error("Failed to take picture:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("Camera is not running")) {
          errorMessage = "Camera is not active. Please restart the camera.";
        } else if (error.message.includes("permission")) {
          errorMessage =
            "Camera permission issue. Please check app permissions.";
        } else if (
          error.message.includes("storage") ||
          error.message.includes("disk")
        ) {
          errorMessage = "Not enough storage space to save the photo.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Camera Error", `Failed to take picture: ${errorMessage}`, [
        { text: "Try Again", style: "default" },
        { text: "Select from Gallery", onPress: handleSelectFromGallery },
      ]);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          const persistentUri = await storeImageTemporarily(
            result.assets[0].uri
          );
          console.log(
            "CAMERA_DEBUG: Navigating to preview from gallery with URI:",
            persistentUri
          );
          router.push({
            pathname: "/preview",
            params: { imageUri: persistentUri },
          });
        } catch (copyError) {
          Alert.alert(
            "Error",
            "Failed to save selected photo before previewing."
          );
        }
      } else if (result.canceled) {
        console.log("Image selection cancelled");
      } else {
        Alert.alert(
          "Error",
          "No image selected or an unexpected error occurred."
        );
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to access photo library");
    }
  };

  const handleCameraMountError = (error: CameraMountError) => {
    console.error("CAMERA_DEBUG: Camera mount error:", error);
    Alert.alert(
      "Camera Error",
      "Failed to initialize camera. This might be due to another app using the camera or hardware issues.",
      [
        { text: "Try Again", onPress: () => router.replace("/camera") },
        { text: "Use Gallery", onPress: handleSelectFromGallery },
      ]
    );
  };

  return {
    cameraRef,
    facing,
    permission,
    permissionStatus,
    isCameraReady,
    requestCameraPermission,
    handleCameraReady,
    toggleCameraFacing,
    handleCapturePhoto,
    handleSelectFromGallery,
    handleCameraMountError,
  };
}
