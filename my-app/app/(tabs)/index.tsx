import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const handleScanPress = () => {
    router.push("/camera");
  };

  const features = [
    {
      icon: "camera-outline" as const,
      title: "Scan Receipt",
      description: "Take a photo of your receipt with our easy-to-use camera",
    },
    {
      icon: "receipt-outline" as const,
      title: "Process Receipt",
      description: "Our AI extracts all items and prices automatically",
    },
    {
      icon: "create-outline" as const,
      title: "review items",
      description: "review the items and prices and add any missing items",
    },
    {
      icon: "share-social-outline" as const,
      title: "Share Results",
      description: "Share a link with your friends to split the bill",
    },
  ];

  return (
    <ParallaxScrollView>
      <View className="items-center mt-4">
        <View className="w-20 h-20 mb-4 rounded-full bg-sky-100 items-center justify-center">
          <Ionicons name="receipt-outline" size={40} color="#0ea5e9" />
        </View>

        <ThemedText className="text-3xl font-bold mb-2 text-center">
          Cash Splitter
        </ThemedText>

        <ThemedText className="text-center text-lg mb-6 opacity-80">
          Take a photo of your receipt and let AI split the costs among your
          friends. Quick, simple, and accurate!
        </ThemedText>

        <TouchableOpacity
          className="w-full py-4 px-8 rounded-full items-center justify-center bg-sky-400 active:bg-sky-500 shadow-md mb-8"
          onPress={handleScanPress}
        >
          <Text className="text-gray-800 text-lg font-bold">Scan Receipt</Text>
        </TouchableOpacity>

        <View className="w-full">
          <ThemedText className="font-bold text-xl mb-4">
            How it works
          </ThemedText>

          {features.map((feature, index) => (
            <View key={index} className="flex-row mb-5">
              <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center mr-4">
                <Ionicons name={feature.icon} size={24} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <ThemedText className="font-bold text-base">
                  {feature.title}
                </ThemedText>
                <ThemedText className="text-sm opacity-70">
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ParallaxScrollView>
  );
}
