import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CameraBottomControlsProps {
  onCapturePhoto: () => void;
  onSelectFromGallery: () => void;
  isCameraReady: boolean;
  isCapturing: boolean;
  insetsBottom: number;
}

export default function CameraBottomControls({
  onCapturePhoto,
  onSelectFromGallery,
  isCameraReady,
  isCapturing,
  insetsBottom,
}: CameraBottomControlsProps) {
  return (
    <View className="absolute bottom-10 left-0 right-0 px-4 pt-10 z-10">
      {/* Capture Photo Button */}
      <View className="flex-row items-center justify-center relative">
        <TouchableOpacity
          className={`p-1 rounded-full border-4 shadow-lg ${
            isCapturing ? "border-gray-300 opacity-50" : "border-white"
          }`}
          onPress={onCapturePhoto}
          disabled={!isCameraReady || isCapturing}
        >
          <View
            className={`h-20 w-20 rounded-full ${
              isCapturing ? "bg-gray-300" : "bg-white"
            }`}
          />
        </TouchableOpacity>
        {/* Select from Gallery Button */}
        <TouchableOpacity
          className={`absolute left-0 p-3 rounded-full shadow-md ${
            isCapturing ? "bg-gray-300/80 opacity-50" : "bg-white/80"
          }`}
          onPress={onSelectFromGallery}
          disabled={isCapturing}
        >
          <Ionicons
            name="images"
            size={28}
            color={isCapturing ? "#9ca3af" : "#374151"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
