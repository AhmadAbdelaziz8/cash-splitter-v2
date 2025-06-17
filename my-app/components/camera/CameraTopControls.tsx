import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CameraTopControlsProps {
  onBack: () => void;
  onToggleFacing: () => void;
  insetsTop: number;
}

export default function CameraTopControls({
  onBack,
  onToggleFacing,
  insetsTop,
}: CameraTopControlsProps) {
  return (
    <View
      className="absolute top-0 left-0 right-0 z-10"
      style={{ paddingTop: insetsTop }}
    >
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          className="bg-white/80 p-3 rounded-full shadow-md"
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={28} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/80 p-3 rounded-full shadow-md"
          onPress={onToggleFacing}
        >
          <Ionicons name="camera-reverse" size={28} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
