import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function HomeScreen() {
  const handleScanPress = () => {
    router.push("/camera");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          className="h-[200px] w-[290px] absolute bottom-0 left-0"
        />
      }
    >
      <View className="p-4 space-y-6">
        <View className="mt-4 items-center">
          <ThemedText type="title">Cash Splitter</ThemedText>
        </View>

        <View className="items-center">
          <ThemedText>
            Take a photo of your receipt and let AI split the costs among your
            friends.
          </ThemedText>
        </View>

        <TouchableOpacity
          className="py-4 px-8 rounded-full items-center justify-center mt-5 bg-sky-600"
          onPress={handleScanPress}
        >
          <Text className="text-white text-lg font-bold">Scan Receipt</Text>
        </TouchableOpacity>

        {/* We'll add recent links section here later */}
      </View>
    </ParallaxScrollView>
  );
}
