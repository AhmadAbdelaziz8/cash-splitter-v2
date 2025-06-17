import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  storedApiKey: string | null;
  onSettingsPress: () => void;
}

export default function HomeHeader({ storedApiKey, onSettingsPress }: HomeHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-10">
      <Text className="text-4xl font-bold text-slate-800 dark:text-slate-100">
        Cash Splitter
      </Text>
      {storedApiKey && (
        <TouchableOpacity
          className="p-4 rounded-full bg-slate-200 dark:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700 shadow-md"
          onPress={onSettingsPress}
        >
          <Ionicons name="settings-outline" size={28} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
} 