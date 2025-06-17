import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreviewActionsProps {
  onRetake: () => void;
  onProceed: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  bottomInset: number;
}

export default function PreviewActions({
  onRetake,
  onProceed,
  isProcessing,
  hasImage,
  bottomInset,
}: PreviewActionsProps) {
  return (
    <View
      style={{ paddingBottom: bottomInset > 0 ? bottomInset : 20 }}
      className="flex-row justify-around px-5 pt-4 border-t border-slate-200 bg-white"
    >
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-4 px-5 rounded-xl mx-1 bg-slate-200 ${
          isProcessing ? "opacity-60" : ""
        }`}
        onPress={onRetake}
        disabled={isProcessing}
      >
        <Ionicons
          name="camera-reverse-outline"
          size={20}
          color="#475569"
          className="mr-2"
        />
        <Text className="text-slate-700 text-base font-semibold">
          Retake Photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-4 px-5 rounded-xl mx-1 bg-blue-600 ${
          !hasImage || isProcessing ? "opacity-60" : ""
        }`}
        onPress={onProceed}
        disabled={!hasImage || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" size="small" className="mr-2" />
        ) : (
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="white"
            className="mr-2"
          />
        )}
        <Text className="text-white text-base font-semibold">
          {isProcessing ? "Processing..." : "Use This Image"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
