import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ShareErrorStateProps {
  onDone: () => void;
}

export default function ShareErrorState({ onDone }: ShareErrorStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-5">
      <Ionicons
        name="alert-circle-outline"
        size={60}
        color="#ef4444"
        className="mb-5"
      />

      <Text className="text-3xl font-bold text-slate-100 text-center mb-4">
        No Link Available
      </Text>

      <Text className="text-base text-slate-300 text-center mb-8 leading-6">
        Something went wrong, and the shareable link could not be generated.
      </Text>

      <TouchableOpacity
        className="bg-slate-700 flex-row items-center justify-center py-4 px-6 rounded-xl w-full shadow-lg"
        onPress={onDone}
      >
        <Ionicons
          name="home-outline"
          size={20}
          color="#e2e8f0"
          className="mr-3"
        />
        <Text className="text-slate-200 text-lg font-semibold">
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}
