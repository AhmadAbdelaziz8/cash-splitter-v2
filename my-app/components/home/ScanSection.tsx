import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScanSectionProps {
  onScanPress: () => void;
}

export default function ScanSection({ onScanPress }: ScanSectionProps) {
  return (
    <View className="mb-2">
      <View className="items-center mb-10">
        <View className="w-32 h-32 mb-8 rounded-full bg-sky-100 items-center justify-center border-4 border-sky-200 shadow-lg">
          <Ionicons name="scan-outline" size={64} color="#0ea5e9" />
        </View>
        <Text className="text-2xl font-semibold text-slate-700 mb-3 text-center">
          Ready to Scan!
        </Text>
        <Text className="text-lg text-slate-500 mb-10 text-center max-w-md px-4">
          Your API key is set. Capture a receipt to begin splitting expenses
          with ease.
        </Text>
        <TouchableOpacity
          className="w-full max-w-xs py-5 px-10 rounded-full items-center justify-center bg-sky-500 active:bg-sky-600 shadow-xl"
          onPress={onScanPress}
        >
          <View className="flex-row items-center">
            <Ionicons name="camera-outline" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-3">
              Scan New Receipt
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
