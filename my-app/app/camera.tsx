import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType } from "expo-camera";

import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<string>("unknown");
  const [mediaLibraryPermissionStatus, setMediaLibraryPermissionStatus] =
    useState<string>("unknown");

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { resetState } = useReceipt();

  const storeImageTemporarily = async (
    originalUri: string
  ): Promise<string> => {
    try {
      if (Platform.OS === "web") {
        return originalUri;
      }
      const imageDir = FileSystem.documentDirectory + "images/";
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
      const parts = originalUri.split("/");
      const lastSegment = parts.pop() || `fallback_${Date.now()}.jpg`;
      const fileName = `cam_${Date.now()}_${lastSegment}`;
      const newPersistentUri = imageDir + fileName;
      await FileSystem.copyAsync({
        from: originalUri,
        to: newPersistentUri,
      });
      return newPersistentUri;
    } catch (e) {
      throw new Error(
        `Failed to store image: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  useEffect(() => {
    resetState();
    const checkAndRequestAllPermissions = async () => {
      const cameraResult = await ImagePicker.getCameraPermissionsAsync();
      const mediaLibraryResult =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      setCameraPermissionStatus(cameraResult.granted ? "granted" : "denied");
      setMediaLibraryPermissionStatus(
        mediaLibraryResult.granted ? "granted" : "denied"
      );

      if (!cameraResult.granted || !mediaLibraryResult.granted) {
        if (cameraResult.canAskAgain || mediaLibraryResult.canAskAgain) {
          await requestAllPermissions();
        } else {
          Alert.alert(
            "Permissions Required",
            "This app needs camera and photo library access to function. Please grant permission in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    };
    checkAndRequestAllPermissions();
  }, []);

  const requestAllPermissions = async () => {
    try {
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      setCameraPermissionStatus(cameraResult.granted ? "granted" : "denied");
      setMediaLibraryPermissionStatus(
        mediaLibraryResult.granted ? "granted" : "denied"
      );

      if (!cameraResult.granted || !mediaLibraryResult.granted) {
        Alert.alert(
          "Permissions Required",
          "This app needs camera and photo library access to function. Please grant permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not request all necessary permissions.");
      setCameraPermissionStatus("error");
      setMediaLibraryPermissionStatus("error");
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const toggleCameraFacing = () => {
    if (isProcessing) return;
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapturePhoto = async () => {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: false,
        allowsEditing: false,
        aspect: [4, 3],
      });

      let photo = null;
      if (!result.canceled && result.assets && result.assets.length > 0) {
        photo = result.assets[0];
      }

      if (photo && photo.uri) {
        const persistentUri = await storeImageTemporarily(photo.uri);
        router.push({
          pathname: "/preview",
          params: { imageUri: persistentUri },
        });
      } else {
        Alert.alert(
          "Capture Failed",
          "No image data or URI was received from the camera."
        );
      }
    } catch (error) {
      Alert.alert(
        "Camera Error",
        `Failed to take picture: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFromGallery = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Access to your photo library is needed to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        setIsProcessing(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const persistentUri = await storeImageTemporarily(result.assets[0].uri);
        router.push({
          pathname: "/preview",
          params: { imageUri: persistentUri },
        });
      } else if (result.canceled) {
        // User cancelled image selection
      }
    } catch (error) {
      Alert.alert(
        "Gallery Error",
        `Failed to access photo library: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderLoadingView = (message: string) => (
    <View style={[styles.centered, styles.container]}>
      <ActivityIndicator size="large" color="#38bdf8" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );

  const allPermissionsGranted =
    cameraPermissionStatus === "granted" &&
    mediaLibraryPermissionStatus === "granted";
  const canAskAgain =
    cameraPermissionStatus === "denied" ||
    mediaLibraryPermissionStatus === "denied";

  if (isProcessing) {
    return renderLoadingView("Processing Image...");
  }

  if (!allPermissionsGranted) {
    return (
      <View style={[styles.centered, styles.container, styles.padding]}>
        <Ionicons
          name="alert-circle-outline"
          size={60}
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>Permissions Needed</Text>
        <Text style={styles.errorText}>
          This app requires camera and photo library access to scan receipts.
          Please grant access in your device settings.
        </Text>
        <Text style={styles.permissionStatusText}>
          Camera status: {cameraPermissionStatus}, Photo Library status:{" "}
          {mediaLibraryPermissionStatus}
        </Text>
        <TouchableOpacity
          style={[styles.buttonBase, styles.primaryButton, styles.spacingTop]}
          onPress={requestAllPermissions}
          disabled={!canAskAgain}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonBase,
            styles.secondaryButton,
            styles.spacingTopSmall,
          ]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.secondaryButtonText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonBase,
            styles.subtleButton,
            styles.spacingTopSmall,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.subtleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={handleCameraReady}
      />

      <View style={[styles.topControls, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.iconButtonContainer}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity
          style={styles.iconButtonContainer}
          onPress={handleSelectFromGallery}
          disabled={isProcessing}
        >
          <Ionicons name="images-outline" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapturePhoto}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#334155" size="small" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButtonContainer}
          onPress={toggleCameraFacing}
          disabled={isProcessing}
        >
          <Ionicons name="camera-reverse-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  padding: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  errorIcon: {
    color: "#f87171",
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#475569",
  },
  subtleButton: {
    backgroundColor: "transparent",
    borderColor: "#334155",
    borderWidth: 1,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  subtleButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  spacingTop: { marginTop: 20 },
  spacingTopSmall: { marginTop: 12 },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  iconButtonContainer: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  permissionStatusText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
});
