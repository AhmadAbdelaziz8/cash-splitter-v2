import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HomeHeaderProps {
  storedApiKey: string | null;
  onSettingsPress: () => void;
}

export default function HomeHeader({
  storedApiKey,
  onSettingsPress,
}: HomeHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-5">
      <Text className="text-4xl font-bold text-slate-800">Cash Splitter</Text>
      {storedApiKey && (
        <TouchableOpacity
          className="p-4 rounded-3xl bg-slate-200 active:bg-slate-300 shadow-md"
          onPress={onSettingsPress}
        >
          <Ionicons name="settings-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}
