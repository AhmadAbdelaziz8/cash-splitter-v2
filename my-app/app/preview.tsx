import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";

import { parseImage } from "../utils/imageUtils";
import { useReceipt } from "@/contexts/ReceiptContext";

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setImageUri: setContextImageUri, setImageBase64 } = useReceipt();

  const handleRetake = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/camera");
    }
  };

  const handleProceed = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image URI found. Please retake the photo.");
      return;
    }

    try {
      setIsProcessing(true);
      setContextImageUri(imageUri);

      const processedImage = await parseImage(imageUri);
      setImageBase64(processedImage);

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
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 p-5 justify-center items-center">
        {imageUri ? (
          <View className="w-full items-center">
            <Text className="text-lg mb-2 text-center text-gray-800">
              Image Ready for Processing:
            </Text>
            <View className="w-full shadow-md rounded-lg overflow-hidden bg-white">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-80"
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Preview of captured receipt"
              />
            </View>
        
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
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center border-2 border-sky-400 active:bg-sky-50"
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Text className="font-bold text-base text-sky-500">Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center bg-sky-400 active:bg-sky-500"
          onPress={handleProceed}
          disabled={!imageUri || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="font-bold text-base text-gray-800">
              Process Receipt
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
