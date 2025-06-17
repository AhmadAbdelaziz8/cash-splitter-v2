import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorStateProps {
  onRetake: () => void;
}

export default function ErrorState({ onRetake }: ErrorStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-5 bg-white">
      <Ionicons
        name="alert-circle-outline"
        size={60}
        color="#ef4444"
        className="mb-5"
      />
      <Text className="text-2xl font-bold text-slate-900 text-center mb-4">
        No Image Found
      </Text>
      <Text className="text-base text-slate-600 text-center mb-8 leading-6">
        It seems there was an issue receiving the image. Please try capturing it
        again.
      </Text>
      <TouchableOpacity
        className="bg-blue-600 flex-row items-center justify-center py-4 px-6 rounded-xl"
        onPress={onRetake}
      >
        <Ionicons
          name="camera-outline"
          size={20}
          color="white"
          className="mr-2"
        />
        <Text className="text-white text-base font-semibold">
          Recapture Image
        </Text>
      </TouchableOpacity>
    </View>
  );
}
 