import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { parseImage } from "../utils/imageUtils";
import { useReceipt } from "@/contexts/ReceiptContext";

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setImageUri: setContextImageUri, setImageBase64 } = useReceipt();

  const handleRetake = () => {
    if (router.canGoBack()) {
      router.back(); // Go back to the previous screen (likely CameraScreen)
    } else {
      router.replace("/camera"); // Fallback if no history
    }
  };

  const handleProceed = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image URI found. Please retake the photo.");
      console.error("handleProceed: imageUri is missing from search params.");
      return;
    }

    try {
      setIsProcessing(true);
      console.log(`Processing image URI: ${imageUri}`);

      // Save image URI to context
      setContextImageUri(imageUri);

      // Convert image to base64 or use directly on web
      const processedImage = await parseImage(imageUri);

      // Save processed image data to context
      setImageBase64(processedImage);

      if (Platform.OS === "web") {
        console.log("Using web image format");
      } else {
        console.log(
          "Base64 Image (snippet):\n",
          processedImage.substring(0, 100) + "..."
        );
      }

      // Navigate to processing screen
      router.push("/processing");
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Error",
        `Failed to process image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 p-5 justify-center items-center">
        {imageUri ? (
          <View className="w-full items-center">
            <Text className="text-lg mb-2 text-center">
              Image Ready for Processing:
            </Text>
            {/* Display the actual image preview */}
            <View className="w-full shadow-md rounded-lg overflow-hidden bg-white">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-80"
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Preview of captured receipt"
              />
            </View>
            <Text
              className="text-xs text-gray-500 p-1 bg-gray-100 rounded break-all self-stretch text-center mt-2"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              URI: {imageUri}
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-red-500">No image URI provided.</Text>
            <Text className="text-sm text-gray-500 mt-2">
              Please go back and capture a photo.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between p-5 gap-3 border-t border-gray-200">
        <TouchableOpacity
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center border-2 border-sky-600 active:bg-sky-50"
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Text className="font-bold text-base text-sky-600">Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center bg-sky-600 active:bg-sky-700"
          onPress={handleProceed}
          disabled={!imageUri || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-bold text-base text-white">
              Process Receipt
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
