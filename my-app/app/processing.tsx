import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useReceipt } from "@/contexts/ReceiptContext";
import { receiptService } from "@/services/receiptService";
import { ParseResult } from "@/types";

export default function ProcessingScreen() {
  const [processingStep, setProcessingStep] = useState(0);
  const { imageBase64, setProcessedReceiptData, setItems } = useReceipt();

  const steps = [
    "Analyzing receipt...",
    "Identifying items...",
    "Calculating totals...",
    "Preparing results...",
  ];

  useEffect(() => {
    if (!imageBase64) {
      Alert.alert("Error", "No image data found. Please capture a new photo.", [
        { text: "OK", onPress: () => router.replace("/camera") },
      ]);
      return;
    }

    const progressTimer = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(progressTimer);
        return prev;
      });
    }, 800);

    const processImage = async () => {
      try {
        const result: ParseResult = await receiptService.parseReceiptImage(imageBase64);

        if (result.success && result.data) {
          setProcessedReceiptData(result.data);

          if (!result.error || !result.error.toLowerCase().includes("mock")) {
            console.log("🎉 Successfully processed receipt with API");
          }

          setTimeout(() => router.push("/EditItemsScreen"), 500);
        } else {
          const alertTitle = result.error?.includes("API Key")
            ? "API Key Required"
            : "Processing Issue";
          const alertMessage = result.error?.includes("API Key")
            ? "Add your Google API key to analyze real receipts. Showing example data for now."
            : `${result.error || "Unknown error"}. Showing example data instead.`;

          Alert.alert(alertTitle, alertMessage, [{ text: "OK" }]);

          if (result.data) {
            setProcessedReceiptData(result.data);
          } else {
            setItems([]);
          }
          setTimeout(() => router.push("/EditItemsScreen"), 1000);
        }
      } catch (error) {
        console.error("Processing error:", error);
        Alert.alert(
          "Processing Error",
          "There was an issue analyzing your receipt. Please try again.",
          [{ text: "OK" }]
        );
        setItems([]);
        setTimeout(() => router.push("/EditItemsScreen"), 1000);
      }
    };

    setTimeout(processImage, 1000);
    return () => clearInterval(progressTimer);
  }, [imageBase64, setProcessedReceiptData, setItems]);

  const progressPercentage = ((processingStep + 1) / steps.length) * 100;

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-50">
      <View className="items-center w-full max-w-sm">
        <ActivityIndicator size="large" color="#38bdf8" className="mb-5" />
        <Text className="text-2xl font-bold mb-2 text-center text-gray-800">
          Processing Your Receipt
        </Text>
        <Text className="text-base text-center text-gray-600 mb-8">
          {steps[processingStep]}
        </Text>

        <View className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <View
            className="h-full bg-sky-400 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>

        <Text className="text-sm text-center text-gray-500">
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
