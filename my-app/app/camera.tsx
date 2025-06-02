import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
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
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useReceipt } from "@/contexts/ReceiptContext";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
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
      const fileName = `cam_${Date.now()}_${originalUri.split("/").pop()}`;
      const newPersistentUri = imageDir + fileName;
      await FileSystem.copyAsync({
        from: originalUri,
        to: newPersistentUri,
      });
      return newPersistentUri;
    } catch (e) {
      console.error("Error storing image temporarily:", e);
      throw new Error(`Failed to store image: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  useEffect(() => {
    resetState();
    if (permission) {
      setPermissionStatus(permission.granted ? "granted" : "denied");
    }
    const checkAndRequestPermission = async () => {
      if (permission && !permission.granted && permission.canAskAgain) {
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
          "This app needs camera access to function. Please grant permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setPermissionStatus("error");
      Alert.alert("Error", "Could not request camera permission.");
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
    if (!isCameraReady || !cameraRef.current || isProcessing) {
      return;
    }
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: Platform.OS === 'web' ? 0.9 : 0.7,
        base64: false,
        exif: false,
      });

      if (photo?.uri) {
        const persistentUri = await storeImageTemporarily(photo.uri);
        router.push({
          pathname: "/preview",
          params: { imageUri: persistentUri },
        });
      } else {
        Alert.alert("Capture Failed", "No image data was received from the camera.");
      }
    } catch (error) {
      console.error("Capture Error:", error);
      Alert.alert("Camera Error", `Failed to take picture: ${error instanceof Error ? error.message : "Unknown error"}`);
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
      }
    } catch (error) {
      console.error("Gallery Error:", error);
      Alert.alert("Gallery Error", `Failed to access photo library: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderLoadingView = (message: string) => (
    <View style={[styles.centeredView, styles.darkBg]}>
      <ActivityIndicator size="large" color="#38bdf8" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );

  if (isProcessing) {
    return renderLoadingView("Processing Image...");
  }

  if (!permission) {
    return renderLoadingView("Loading Camera Permissions...");
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centeredView, styles.darkBg, styles.paddingLg]}>
        <Ionicons name="alert-circle-outline" size={60} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>
          Camera Access Needed
        </Text>
        <Text style={styles.permissionText}>
          This app requires camera permission to scan receipts. Please grant access in your device settings.
        </Text>
        <Text style={styles.permissionStatusText}>
          Current status: {permissionStatus}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.mtLg]}
          onPress={requestCameraPermission}
          disabled={!permission.canAskAgain}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, styles.mtMd]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.secondaryButtonText}>Open Settings</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={[styles.button, styles.subtleButton, styles.mtMd]}
          onPress={() => router.back()}
        >
          <Text style={styles.subtleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.darkBg]}>
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

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
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
          disabled={!isCameraReady || isProcessing}
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
  },
  darkBg: {
    backgroundColor: "#0f172a",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paddingLg: {
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#cbd5e1",
  },
  permissionIcon: {
    color: "#f87171",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 10,
  },
  permissionStatusText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#334155",
  },
  subtleButton: {
    backgroundColor: "transparent",
    borderColor: "#334155",
    borderWidth: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
  },
  subtleButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  mtLg: { marginTop: 20 },
  mtMd: { marginTop: 15 },
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
});
