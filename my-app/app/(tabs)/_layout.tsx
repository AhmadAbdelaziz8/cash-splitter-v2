import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme"; // Assuming you have this hook

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const iconColor = colorScheme === "dark" ? "#cbd5e1" : "#4b5563"; // slate-300 dark, slate-600 light
  const activeIconColor = colorScheme === "dark" ? "#3b82f6" : "#2563eb"; // blue-500 dark, blue-600 light
  const tabBarBackgroundColor = colorScheme === "dark" ? "#1e293b" : "#ffffff"; // slate-800 dark, white light
  const borderTopColor = colorScheme === "dark" ? "#334155" : "#e5e7eb"; // slate-700 dark, gray-200 light

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        tabBarStyle: {
          display: "none", // Hide the bottom bar
        },
        tabBarShowLabel: false, // Hiding labels for a cleaner look
      }}
    ></Tabs>
  );
}
