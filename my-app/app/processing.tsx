import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Alert, Platform } from "react-native";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useReceipt } from "@/contexts/ReceiptContext";

export default function ProcessingScreen() {
  const colorScheme = useColorScheme();
  const [processingStep, setProcessingStep] = useState(0);
  const { imageBase64 } = useReceipt();

  const processingSteps = [
    "Analyzing receipt...",
    "Identifying items...",
    "Calculating totals...",
    "Preparing results...",
  ];

  useEffect(() => {
    // Check if we have image data to process
    if (!imageBase64) {
      console.error("No image data available in context");
      Alert.alert("Error", "No image data found. Please capture a new photo.", [
        {
          text: "OK",
          onPress: () => router.replace("/camera"),
        },
      ]);
      return;
    }

    console.log(`Processing screen accessed. Platform: ${Platform.OS}`);

    // Simulate processing with steps
    const progressTimer = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(progressTimer);
        return prev;
      });
    }, 800);

    // In a real app, we would process the image here using AI/ML
    // For now, we just navigate to the results screen after a delay
    const navigationTimer = setTimeout(() => {
      router.push("/results");
    }, 3500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(navigationTimer);
    };
  }, [imageBase64]);

  // Calculate progress percentage
  const progressPercentage =
    ((processingStep + 1) / processingSteps.length) * 100;

  return (
    <View className="flex-1 justify-center items-center p-5">
      <View className="items-center w-full max-w-sm">
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          className="mb-5"
        />
        <Text className="text-2xl font-bold mb-2 text-center">
          Processing Your Receipt
        </Text>
        <Text className="text-base text-center opacity-70 mb-8">
          {processingSteps[processingStep]}
        </Text>

        {/* Progress bar */}
        <View className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <View
            className="h-full bg-sky-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>

        <Text className="text-sm text-center opacity-50">
          This will just take a moment...
        </Text>

        {Platform.OS === "web" && (
          <Text className="text-xs text-center mt-4 opacity-50">
            Note: In web mode, receipt analysis is simulated.
          </Text>
        )}
      </View>
    </View>
  );
}
