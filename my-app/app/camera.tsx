import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBack = () => {
    router.back();
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
        console.error("Error taking picture:", error);
        alert("Failed to take picture");
      }
    }
  };

  const handlePickImage = async () => {
    // Request permission for image picker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Pick an image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      router.push({
        pathname: "/preview",
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg text-center px-4">
          No access to camera. Please enable camera permissions in your device
          settings.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity
            className="mt-4 py-3 px-6 bg-sky-600 rounded-full"
            onPress={requestPermission}
          >
            <Text className="text-white font-bold">Grant Permission</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="mt-4 py-3 px-6 bg-sky-600 rounded-full"
          onPress={handleBack}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={styles.absoluteFill} facing="back" />

      <View
        className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4"
        style={{ paddingTop: insets.top || 16 }}
      >
        {/* Back button */}
        <TouchableOpacity
          className="py-2 px-4 rounded-full bg-black/50"
          onPress={handleBack}
        >
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      <View
        className="flex-row justify-evenly items-center bg-black/50 absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: Math.max(insets.bottom + 8, 16) }}
      >
        {/* Gallery button */}
        <TouchableOpacity
          className="p-3 rounded-full"
          onPress={handlePickImage}
        >
          <Ionicons name="images" size={28} color="white" />
        </TouchableOpacity>

        {/* Capture button */}
        <TouchableOpacity
          className="w-[70px] h-[70px] my-4 rounded-full border-4 border-white bg-white/20 justify-center items-center"
          onPress={handleCapturePhoto}
        >
          <View className="w-[54px] h-[54px] rounded-full bg-white" />
        </TouchableOpacity>

        {/* Placeholder for symmetry */}
        <View className="w-[34px]" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  absoluteFill: StyleSheet.absoluteFillObject,
});
