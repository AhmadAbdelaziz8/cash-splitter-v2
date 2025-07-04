import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Linking, Platform } from "react-native";
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
  cameraRef: React.RefObject<CameraView | null>;
  facing: CameraType;
  permission: ReturnType<typeof useCameraPermissions>[0];
  permissionStatus: string;
  isCameraReady: boolean;
  isCapturing: boolean;
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
  const [isCapturing, setIsCapturing] = useState(false);
  const isCapturingRef = useRef(false);
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
            const fileName = Date.now() + "_receipt.jpg";
            const newPersistentUri = imageDir + fileName;
            await FileSystem.copyAsync({
              from: originalUri,
              to: newPersistentUri,
            });
            if (__DEV__) {
              console.log(
                "CAMERA_DEBUG: Image copied to persistent URI:",
                newPersistentUri
              );
            }
            return newPersistentUri;
          } catch (e) {
            if (__DEV__) {
              console.error(
                "CAMERA_DEBUG: Failed to copy image to persistent dir:",
                e
              );
            }
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

  const handleCameraReady = useCallback(() => {
    console.log("CAMERA_DEBUG: Camera is ready");
    setIsCameraReady(true);
    isCapturingRef.current = false;
    setIsCapturing(false);
  }, []);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const handleCapturePhoto = useCallback(async () => {
    if (isCapturingRef.current) {
      if (__DEV__) console.log("CAMERA_DEBUG: Capture already in progress.");
      return;
    }

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

    isCapturingRef.current = true;
    setIsCapturing(true);
    console.log("CAMERA_DEBUG: Starting photo capture");

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        base64: false,
        exif: false,
      });

      console.log(
        "CAMERA_DEBUG: Photo captured:",
        photo?.uri ? "Success" : "Failed"
      );

      if (photo?.uri) {
        const persistentUri = await storeImageTemporarily(photo.uri);
        console.log(
          "CAMERA_DEBUG: Navigating to preview with URI:",
          persistentUri
        );
        router.push({
          pathname: "/preview",
          params: { imageUri: persistentUri },
        });
      } else {
        Alert.alert(
          "Error",
          "Failed to capture photo - no image data received. Please try again."
        );
      }
    } catch (error) {
      console.error("CAMERA_DEBUG: Failed to take picture:", error);
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert("Camera Error", `Failed to take picture: ${errorMessage}`, [
        { text: "Try Again", style: "default" },
        { text: "Select from Gallery", onPress: handleSelectFromGallery },
      ]);
    } finally {
      console.log("CAMERA_DEBUG: Finalizing capture, resetting state.");
      isCapturingRef.current = false;
      setIsCapturing(false);
    }
  }, [isCameraReady, handleSelectFromGallery, storeImageTemporarily]);

  const handleSelectFromGallery = useCallback(async () => {
    if (isCapturingRef.current) {
      if (__DEV__)
        console.log("CAMERA_DEBUG: Gallery selection already in progress.");
      return;
    }

    isCapturingRef.current = true;
    setIsCapturing(true);

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
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const persistentUri = await storeImageTemporarily(result.assets[0].uri);
        console.log(
          "CAMERA_DEBUG: Navigating to preview from gallery with URI:",
          persistentUri
        );
        router.push({
          pathname: "/preview",
          params: { imageUri: persistentUri },
        });
      }
    } catch (error) {
      console.error("CAMERA_DEBUG: Error picking image:", error);
      Alert.alert("Error", "Failed to access photo library");
    } finally {
      isCapturingRef.current = false;
      setIsCapturing(false);
    }
  }, [storeImageTemporarily]);

  const handleCameraMountError = useCallback(
    (error: CameraMountError) => {
      console.error("CAMERA_DEBUG: Camera mount error:", error);
      isCapturingRef.current = false;
      setIsCapturing(false);
      setIsCameraReady(false);
      Alert.alert(
        "Camera Error",
        "Failed to initialize camera. This might be due to another app using the camera or hardware issues.",
        [
          {
            text: "Try Again",
            onPress: () => {
              router.replace("/camera");
            },
          },
          { text: "Use Gallery", onPress: handleSelectFromGallery },
        ]
      );
    },
    [handleSelectFromGallery]
  );

  return {
    cameraRef,
    facing,
    permission,
    permissionStatus,
    isCameraReady,
    isCapturing,
    requestCameraPermission,
    handleCameraReady,
    toggleCameraFacing,
    handleCapturePhoto,
    handleSelectFromGallery,
    handleCameraMountError,
  };
}
