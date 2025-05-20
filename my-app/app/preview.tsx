import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, Alert } from "react-native"; // Added Alert
import { parseImage } from "../utils/imageUtils"; // Assuming imageUtils.js is in my-app/utils/

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

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
      console.log(`Processing image URI: ${imageUri}`);
      // TODO: Show a proper loading indicator using state or context

      const base64Image = await parseImage(imageUri);

      console.log(
        "Base64 Image (snippet):\n",
        base64Image.substring(0, 100) + "..."
      );
      Alert.alert(
        "Success",
        "Image converted to Base64! Check console for a snippet. Next: Send to LLM."
      );

      // For now, just navigating. Later, we'll pass data or use context.
      router.push("/processing");
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Error",
        `Failed to process image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // TODO: Hide loading indicator here
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 p-5 justify-center items-center">
        {imageUri ? (
          <View>
            <Text className="text-lg mb-2 text-center">
              Image Ready for Processing:
            </Text>
            {/* 
              TODO: Display the actual image preview here. 
              You'll need to import the Image component from 'expo-image' or 'react-native'
              Example: <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, resizeMode: 'contain' }} /> 
            */}
            <View className="w-full h-64 bg-gray-200 my-4 rounded-lg justify-center items-center border border-gray-300">
              <Text className="text-gray-500">(Image Preview Placeholder)</Text>
            </View>
            <Text
              className="text-xs text-gray-500 p-1 bg-gray-100 rounded break-all self-stretch text-center"
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
        >
          <Text className="font-bold text-base text-sky-600">Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center bg-sky-600 active:bg-sky-700"
          onPress={handleProceed}
          disabled={!imageUri} // Disable button if no imageUri
        >
          <Text className="font-bold text-base text-white">
            Process Receipt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
