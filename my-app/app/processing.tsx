import { useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProcessingScreen() {
  const colorScheme = useColorScheme();

  // Simulate processing time and then navigate to results
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to results screen after 3 seconds
      router.push("/results");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          style={styles.spinner}
        />
        <ThemedText style={styles.loadingText}>
          Processing Your Receipt
        </ThemedText>
        <ThemedText style={styles.subText}>
          Our AI is analyzing the receipt and extracting items...
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
});
