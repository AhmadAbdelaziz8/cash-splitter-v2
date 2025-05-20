import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function PreviewScreen() {
  const colorScheme = useColorScheme();

  const handleRetake = () => {
    router.push("/camera");
  };

  const handleProceed = () => {
    // In a real app, this would process the image
    // For now, we'll just show a loading screen
    router.push("/processing");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.previewContainer}>
        <ThemedView style={styles.imagePreview}>
          <ThemedText style={styles.placeholderText}>Receipt Image</ThemedText>
          <ThemedText style={styles.placeholderSubtext}>
            (This is a placeholder - actual image will appear here)
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleRetake}
        >
          <ThemedText
            style={[
              styles.buttonText,
              { color: Colors[colorScheme ?? "light"].tint },
            ]}
          >
            Retake
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleProceed}
        >
          <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
            Process Receipt
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  imagePreview: {
    flex: 1,
    backgroundColor: "#e1e1e1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderText: {
    fontSize: 24,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#0a7ea4",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  primaryButtonText: {
    color: "white",
  },
});
