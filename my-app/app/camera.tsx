import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";

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
  const cameraRef = useRef<any>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const { resetState } = useReceipt();

  // Reset receipt state when opening camera
  useEffect(() => {
    resetState();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        router.push({
          pathname: "/preview",
          params: { imageUri: photo.uri },
        });
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        router.push({
          pathname: "/preview",
          params: { imageUri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
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
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg mb-4 text-center">
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
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
