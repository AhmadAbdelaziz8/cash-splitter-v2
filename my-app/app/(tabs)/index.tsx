// import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function HomeScreen() {
  const handleScanPress = () => {
    router.push("/camera");
  };

  return (
    <ParallaxScrollView>
      <View className="items-center">
        <ThemedText className="text-center">
          Take a photo of your receipt and let AI split the costs among your
          friends.
        </ThemedText>
      </View>

      <TouchableOpacity
        className="py-4 px-8 rounded-full items-center justify-center mt-8 bg-sky-600 active:bg-sky-700 shadow-md"
        onPress={handleScanPress}
      >
        <Text className="text-white text-lg font-bold">Scan Receipt</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}
