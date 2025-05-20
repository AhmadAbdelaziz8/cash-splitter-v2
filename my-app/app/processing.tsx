import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProcessingScreen() {
  const colorScheme = useColorScheme();

  // Simulate processing time and then navigate to results
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to results screen after 3 seconds
      router.push("/results");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center p-5">
      <View className="items-center">
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          className="mb-5"
        />
        <Text className="text-2xl font-bold mb-2 text-center">
          Processing Your Receipt
        </Text>
        <Text className="text-base text-center opacity-70">
          Our AI is analyzing the receipt and extracting items...
        </Text>
      </View>
    </View>
  );
}
