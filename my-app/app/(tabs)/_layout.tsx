import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
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
          backgroundColor: tabBarBackgroundColor,
          paddingBottom: bottom > 0 ? bottom -5 : 5, // Adjust padding based on safe area
          paddingTop: 10,
          height: bottom > 0 ? 60 + bottom -5: 70, // Adjust height
          borderTopWidth: 1,
          borderTopColor: borderTopColor,
          shadowColor: colorScheme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: colorScheme === "dark" ? 0.25 : 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarShowLabel: false, // Hiding labels for a cleaner look
      }}
    >
      <Tabs.Screen
        name="index" // This should match your home screen file name in (tabs) dir
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? activeIconColor : iconColor}
            />
          ),
        }}
      />
      {/* Add other Tabs.Screen here if you have more tabs */}
      {/* For example, if you had a settings tab: */}
      {/* <Tabs.Screen 
        name="settings" 
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={size} 
              color={focused ? activeIconColor : iconColor} 
            />
          ),
        }}
      /> */}
    </Tabs>
  );
}
