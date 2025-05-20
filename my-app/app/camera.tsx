import { router } from "expo-router";
import { View, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";

export default function CameraScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleCapturePhoto = () => {
    // This is a placeholder for when we implement the actual camera
    alert("Photo captured! (This is just a placeholder)");
    // Navigate to the preview screen
    router.push("/preview");
  };

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center bg-gray-800">
        <ThemedText className="text-white text-2xl mb-2">
          Camera Preview
        </ThemedText>
        <ThemedText className="text-white text-sm">
          (Camera functionality will be implemented in the next step)
        </ThemedText>
      </View>

      <View className="flex-row justify-between items-center p-5">
        <TouchableOpacity
          className="py-3 px-5 rounded-full bg-sky-600"
          onPress={handleBack}
        >
          <ThemedText className="text-white font-bold">Back</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[70px] h-[70px] rounded-full border-4 border-sky-600 bg-white justify-center items-center"
          onPress={handleCapturePhoto}
        >
          <View className="w-[50px] h-[50px] rounded-full bg-sky-600" />
        </TouchableOpacity>

        {/* Placeholder for symmetry in layout */}
        <View className="w-[70px]" />
      </View>
    </View>
  );
}
