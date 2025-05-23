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
        console.log("Camera permission not granted, requesting...");
        await requestCameraPermission();
      }
    };

    checkAndRequestPermission();
  }, [permission]);

  // Separate function to handle permission request
  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera permission...");
      const result = await requestPermission();

      console.log("Permission request result:", result);
      setPermissionStatus(result.granted ? "granted" : "denied");

      // If permission is still denied after request
      if (!result.granted) {
        console.log("Permission denied after request, showing alert");
        Alert.alert(
          "Camera Permission Required",
          "This app needs camera access to function properly. Please grant permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                console.log("Opening settings...");
                Linking.openSettings();
              },
            },
          ]
        );
      } else {
        console.log("Camera permission successfully granted!");
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setPermissionStatus("error");
    }
  };

  const handleCameraReady = () => {
    console.log("Camera is ready");
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
      console.log("Camera not ready yet");
      Alert.alert(
        "Camera not ready",
        "Please wait for the camera to initialize"
      );
      return;
    }

    if (!cameraRef.current) {
      console.log("Camera ref is null");
      return;
    }

    try {
      console.log("Attempting to take picture...");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false, // Make sure processing is not skipped
        base64: false,
      });

      console.log("Picture taken successfully:", photo.uri);

      if (photo && photo.uri) {
        router.push({
          pathname: "/preview",
          params: { imageUri: photo.uri },
        });
      } else {
        console.error("Photo object or URI is undefined");
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      <View className="flex-1 justify-center items-center">
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center p-4 bg-black">
        <Text className="text-lg mb-4 text-center text-white">
          We need your permission to use the camera
        </Text>
        <Text className="text-sm mb-6 text-center text-gray-300">
          Permission status: {permissionStatus}
          {Platform.OS === "android" && ` (Android ${Platform.Version})`}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-md"
          onPress={requestCameraPermission}
        >
          <Text className="text-white font-bold text-center text-base">
            GRANT PERMISSION
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-2 px-4"
          onPress={() => {
            console.log("Opening settings directly");
            Linking.openSettings();
          }}
        >
          <Text className="text-blue-300 text-center">Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        facing={facing}
        style={{ flex: 1 }}
        onCameraReady={handleCameraReady}
        autofocus="on"
      >
        {/* Top Control Bar */}
        <SafeAreaView className="absolute top-0 left-0 right-0">
          <View className="flex-row items-center justify-between p-4">
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Bottom Control Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 py-10 px-4"
          style={{
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          }}
        >
          <View className="flex-row items-center justify-between">
            {/* Gallery Button */}
            <TouchableOpacity
              className="bg-black/30 p-3 rounded-full"
              onPress={handleSelectFromGallery}
            >
              <Ionicons name="images" size={28} color="white" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              className="bg-white p-1 rounded-full"
              onPress={handleCapturePhoto}
              disabled={!isCameraReady}
            >
              <View className="h-16 w-16 rounded-full border-2 border-white" />
            </TouchableOpacity>

            {/* Flash Button - Placeholder/Disabled for now */}
            <TouchableOpacity className="bg-black/30 p-3 rounded-full">
              <Ionicons name="flash-off" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: StyleSheet.absoluteFillObject,
});
