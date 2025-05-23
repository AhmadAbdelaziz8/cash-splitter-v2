import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  LogBox,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useReceipt } from "@/contexts/ReceiptContext";

// Ignore specific warnings related to expo-camera
LogBox.ignoreLogs(["ViewPropTypes will be removed from React Native"]);

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 8,
    borderRadius: 24,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 40,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  captureButton: {
    backgroundColor: "#38bdf8",
    padding: 4,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
  },
  captureButtonInner: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#0ea5e9",
  },
});

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { resetState } = useReceipt();

  // Reset receipt state when opening camera
  useEffect(() => {
    resetState();

    if (permission) {
      setPermissionStatus(permission.granted ? "granted" : "denied");
    }

    // Auto-request camera permission when component mounts
    const checkAndRequestPermission = async () => {
      if (permission && !permission.granted) {
        await requestCameraPermission();
      }
    };

    checkAndRequestPermission();
  }, [permission]);

  // Separate function to handle permission request
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

  const handleBack = () => {
    router.back();
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

    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        base64: false,
      });

      if (photo?.uri) {
        router.push({
          pathname: "/preview",
          params: { imageUri: photo.uri },
        });
      } else {
        Alert.alert("Error", "Failed to capture photo");
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to take picture: ${errorMessage}`);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      // Request media library permissions
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
        mediaTypes: "Images" as any,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        router.push({
          pathname: "/preview",
          params: { imageUri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to access photo library");
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-800">Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-lg mb-4 text-center text-gray-800">
          We need your permission to use the camera
        </Text>
        <Text className="text-sm mb-6 text-center text-gray-600">
          Permission status: {permissionStatus}
          {Platform.OS === "android" && ` (Android ${Platform.Version})`}
        </Text>
        <TouchableOpacity
          className="bg-sky-400 py-3 px-6 rounded-md"
          onPress={requestCameraPermission}
        >
          <Text className="text-gray-800 font-bold text-center text-base">
            GRANT PERMISSION
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-2 px-4"
          onPress={() => Linking.openSettings()}
        >
          <Text className="text-sky-500 text-center">Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={handleCameraReady}
        autofocus="on"
      >
        <View style={[styles.topOverlay, { paddingTop: insets.top }]}>
          <SafeAreaView>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={28} color="#374151" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View
          style={[
            styles.bottomOverlay,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
          ]}
        >
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSelectFromGallery}
            >
              <Ionicons name="images" size={28} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapturePhoto}
              disabled={!isCameraReady}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="flash-off" size={28} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
