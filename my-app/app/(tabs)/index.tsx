import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const handleScanPress = () => {
    router.push("/camera");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Cash Splitter</ThemedText>
        </ThemedView>

        <ThemedView style={styles.descriptionContainer}>
          <ThemedText>
            Take a photo of your receipt and let AI split the costs among your
            friends.
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.scanButton,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleScanPress}
        >
          <ThemedText style={styles.buttonText}>Scan Receipt</ThemedText>
        </TouchableOpacity>

        {/* We'll add recent links section here later */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  titleContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  descriptionContainer: {
    alignItems: "center",
  },
  scanButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerImage: {
    height: 200,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
