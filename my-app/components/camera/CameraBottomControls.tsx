import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
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
  const canCapture = isCameraReady && !isCapturing;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 z-10"
      style={{ paddingBottom: Math.max(insetsBottom, 32) }}
    >
      {/* Status indicator */}
      {!isCameraReady && (
        <View className="mb-4 items-center">
          <Text className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            Camera initializing...
          </Text>
        </View>
      )}

      {isCapturing && (
        <View className="mb-4 items-center">
          <Text className="text-white text-sm bg-blue-600/80 px-3 py-1 rounded-full">
            Capturing photo...
          </Text>
        </View>
      )}

      {/* Main controls */}
      <View className="flex-row items-center justify-center relative">
        {/* Gallery Button */}
        <TouchableOpacity
          className={`absolute left-0 p-4 rounded-full shadow-lg ${
            isCapturing ? "bg-gray-400/60" : "bg-white/90"
          }`}
          onPress={onSelectFromGallery}
          disabled={isCapturing}
          accessible={true}
          accessibilityLabel="Select photo from gallery"
          accessibilityHint="Choose an existing photo from your photo library"
        >
          <Ionicons
            name="images"
            size={24}
            color={isCapturing ? "#9ca3af" : "#374151"}
          />
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          className={`p-2 rounded-full border-4 shadow-lg ${
            !canCapture
              ? "border-gray-400 bg-gray-300"
              : "border-white bg-white"
          }`}
          onPress={onCapturePhoto}
          disabled={!canCapture}
          accessible={true}
          accessibilityLabel={
            !isCameraReady
              ? "Camera not ready"
              : isCapturing
              ? "Taking photo..."
              : "Take photo"
          }
          accessibilityHint="Capture a photo of your receipt"
        >
          <View
            className={`h-16 w-16 rounded-full ${
              !canCapture ? "bg-gray-400" : "bg-red-500"
            }`}
          />
        </TouchableOpacity>

        {/* Right spacer for symmetry */}
        <View className="absolute right-0 p-4 w-14 h-14" />
      </View>
    </View>
  );
}
