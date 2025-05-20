import { StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function CameraScreen() {
  const colorScheme = useColorScheme();

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
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cameraPreview}>
        <ThemedText style={styles.placeholderText}>Camera Preview</ThemedText>
        <ThemedText style={styles.placeholderSubtext}>
          (Camera functionality will be implemented in the next step)
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleBack}
        >
          <ThemedText style={styles.buttonText}>Back</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.captureButton,
            { borderColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleCapturePhoto}
        >
          <ThemedView
            style={[
              styles.captureButtonInner,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
          />
        </TouchableOpacity>

        {/* Placeholder for symmetry in layout */}
        <ThemedView style={styles.buttonPlaceholder} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
  },
  placeholderText: {
    color: "white",
    fontSize: 24,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: "white",
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonPlaceholder: {
    width: 70,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
