import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { IconSymbol } from "@/components/IconSymbol";
import TabBarBackground from "@/components/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Use light theme colors only
  const iconColor = "#4b5563"; // slate-600
  const activeIconColor = "#2563eb"; // blue-600
  const tabBarBackgroundColor = "#ffffff"; // white
  const borderTopColor = "#e5e7eb"; // gray-200

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: tabBarBackgroundColor,
            borderTopColor: borderTopColor,
          },
          default: {
            backgroundColor: tabBarBackgroundColor,
            borderTopColor: borderTopColor,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "house.fill" : "house"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
