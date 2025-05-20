import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function PreviewScreen() {
  const handleRetake = () => {
    router.push("/camera");
  };

  const handleProceed = () => {
    // In a real app, this would process the image
    // For now, we'll just show a loading screen
    router.push("/processing");
  };

  return (
    <View className="flex-1">
      <View className="flex-1 p-5">
        <View className="flex-1 bg-gray-200 rounded-lg justify-center items-center overflow-hidden">
          <Text className="text-2xl mb-2">Receipt Image</Text>
          <Text className="text-sm text-center px-5">
            (This is a placeholder - actual image will appear here)
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between p-5 gap-3">
        <TouchableOpacity
          className="flex-1 py-4 rounded-lg items-center justify-center border-2 border-sky-600"
          onPress={handleRetake}
        >
          <Text className="font-bold text-base text-sky-600">
            Retake
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-600"
          onPress={handleProceed}
        >
          <Text className="font-bold text-base text-white">
            Process Receipt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
