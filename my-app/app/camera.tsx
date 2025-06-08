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
} from "react-native";
import * as FileSystem from "expo-file-system";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
  const { resetState } = useReceipt();

  const storeImageTemporarily = async (
    originalUri: string
  ): Promise<string> => {
    // This function should now only be called on native platforms
    try {
      const imageDir = FileSystem.documentDirectory + "images/";
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
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
      console.error("CAMERA_DEBUG: Failed to copy image to persistent dir:", e);
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
    console.log("CAMERA_DEBUG: Camera is ready event fired!");
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
        if (Platform.OS === "web") {
          console.log(
            "CAMERA_DEBUG: Web platform capture - pushing original URI to preview:",
            photo.uri
          );
          router.push({
            pathname: "/preview",
            params: { imageUri: photo.uri },
          });
        } else {
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
        if (Platform.OS === "web") {
          console.log(
            "CAMERA_DEBUG: Web platform gallery - pushing original URI to preview:",
            result.assets[0].uri
          );
          router.push({
            pathname: "/preview",
            params: { imageUri: result.assets[0].uri },
          });
        } else {
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

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-800">Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
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
    <View className="flex-1 bg-slate-100">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={handleCameraReady}
        autofocus="on"
        onMountError={(error) => {
          console.error("CAMERA_DEBUG: Camera mount error:", error);
          Alert.alert(
            "Camera Error",
            "Failed to initialize camera. This might be due to another app using the camera or hardware issues.",
            [
              { text: "Try Again", onPress: () => router.replace("/camera") },
              { text: "Use Gallery", onPress: handleSelectFromGallery },
            ]
          );
        }}
      />

      <View
        className="absolute top-0 left-0 right-0 z-10"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity
            className="bg-white/80 p-2 rounded-full"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white/80 p-2 rounded-full"
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={28} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-10 z-10"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
        }}
      >
        {/* select from gallery button */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="bg-white/80 p-2 rounded-full"
            onPress={handleSelectFromGallery}
          >
            <Ionicons name="images" size={28} color="#374151" />
          </TouchableOpacity>
          {/* capture photo button */}
          <TouchableOpacity
            className="bg-sky-400 p-1 rounded-full border-4 border-white"
            onPress={handleCapturePhoto}
            disabled={!isCameraReady}
          >
            <View className="h-16 w-16 rounded-full bg-sky-500" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
