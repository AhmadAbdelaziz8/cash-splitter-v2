import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingBottom: bottom }}>
      <Slot />
    </View>
  );
}
