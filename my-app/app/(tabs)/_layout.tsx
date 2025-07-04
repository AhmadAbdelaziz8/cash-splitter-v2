import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/IconSymbol";
import TabBarBackground from "@/components/TabBarBackground";

export default function TabLayout() {
  // Use light theme colors only
  const iconColor = "#4b5563"; // slate-600
  const activeIconColor = "#2563eb"; // blue-600

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          display: "none", // Hide the entire tab bar
        },
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
