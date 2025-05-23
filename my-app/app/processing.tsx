import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";
import { parseReceiptImage, ParseResult } from "@/config/geminiConfig";

export default function ProcessingScreen() {
  const [processingStep, setProcessingStep] = useState(0);
  const { imageBase64, setItems } = useReceipt();

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
        const result: ParseResult = await parseReceiptImage(imageBase64);

        if (result.success && result.data?.items) {
          const formattedItems: ReceiptItem[] = result.data.items.map(
            (item, index) => ({
              id: `${index + 1}`,
              name: item.itemName,
              price: item.itemPrice,
              selected: false,
              assignedTo: [],
            })
          );

          setItems(formattedItems);

          // Show success message if real API was used
          if (result.success) {
            console.log("🎉 Successfully processed receipt with Gemini AI");
          }

          setTimeout(() => router.push("/results"), 500);
        } else {
          // Handle the case where we got mock data due to API issues
          if (result.data?.items) {
            const formattedItems: ReceiptItem[] = result.data.items.map(
              (item, index) => ({
                id: `${index + 1}`,
                name: item.itemName,
                price: item.itemPrice,
                selected: false,
                assignedTo: [],
              })
            );

            setItems(formattedItems);

            // Show appropriate message based on the error
            const alertTitle = result.error?.includes("API Key")
              ? "API Key Required"
              : "Processing Issue";
            const alertMessage = result.error?.includes("API Key")
              ? "Add your Google API key to analyze real receipts. Showing example data for now."
              : `${
                  result.error || "Unknown error"
                }. Showing example data instead.`;

            Alert.alert(alertTitle, alertMessage, [{ text: "OK" }]);
            setTimeout(() => router.push("/results"), 1000);
          } else {
            throw new Error("No data available");
          }
        }
      } catch (error) {
        console.error("Processing error:", error);
        Alert.alert(
          "Processing Error",
          "There was an issue analyzing your receipt. Please try again.",
          [{ text: "OK" }]
        );
        setTimeout(() => router.push("/results"), 1000);
      }
    };

    setTimeout(processImage, 1000);
    return () => clearInterval(progressTimer);
  }, [imageBase64, setItems]);

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
