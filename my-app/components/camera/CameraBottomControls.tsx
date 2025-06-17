import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CameraBottomControlsProps {
  onCapturePhoto: () => void;
  onSelectFromGallery: () => void;
  isCameraReady: boolean;
  insetsBottom: number;
}

export default function CameraBottomControls({
  onCapturePhoto,
  onSelectFromGallery,
  isCameraReady,
  insetsBottom,
}: CameraBottomControlsProps) {
  return (
    <View className="absolute bottom-10 left-0 right-0 px-4 pt-10 z-10">
      {/* Capture Photo Button */}
      <View className="flex-row items-center justify-center relative">
        <TouchableOpacity
          className=" p-1 rounded-full border-4 border-white shadow-lg"
          onPress={onCapturePhoto}
          disabled={!isCameraReady}
        >
          <View className="h-20 w-20 rounded-full bg-white" />
        </TouchableOpacity>
        {/* Select from Gallery Button */}
        <TouchableOpacity
          className="absolute left-0 bg-white/80 p-3 rounded-full shadow-md"
          onPress={onSelectFromGallery}
        >
          <Ionicons name="images" size={28} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
