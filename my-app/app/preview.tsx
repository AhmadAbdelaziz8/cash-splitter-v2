import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { parseImage } from "../utils/imageUtils";
import { useReceipt } from "@/contexts/ReceiptContext";

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setImageUri: setContextImageUri, setImageBase64 } = useReceipt();
  const insets = useSafeAreaInsets();

  const handleRetake = () => {
    if (isProcessing) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/camera");
    }
  };

  const handleProceed = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image URI found. Please retake the photo.");
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      setContextImageUri(imageUri);
      const base64Image = await parseImage(imageUri);
      setImageBase64(base64Image);
      router.push("/EditItemsScreen");
    } catch (error) {
      console.error("Error processing image for preview:", error);
      Alert.alert(
        "Processing Error",
        `Failed to prepare image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsProcessing(false);
    }
  };

  if (!imageUri) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingBottom: insets.bottom },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={60}
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>No Image Found</Text>
        <Text style={styles.errorText}>
          It seems there was an issue receiving the image. Please try capturing
          it again.
        </Text>
        <TouchableOpacity
          style={[styles.buttonBase, styles.primaryButton, styles.mtLarge]}
          onPress={handleRetake}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Recapture Image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={[styles.floatingBackButton, { top: insets.top + 10 }]}
        onPress={handleRetake}
        disabled={isProcessing}
      >
        <Ionicons name="arrow-back-outline" size={28} color="#e2e8f0" />
      </TouchableOpacity>
      {/* image preview container */}
      <View style={styles.imagePreviewContainer}>
        
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Preview of captured receipt"
        />
      </View>

      <View
        style={[
          styles.actionsContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.buttonBase,
            styles.secondaryButton,
            isProcessing && styles.disabledButton,
          ]}
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={20}
            style={styles.secondaryButtonIcon}
          />
          <Text style={styles.secondaryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonBase,
            styles.primaryButton,
            (!imageUri || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleProceed}
          disabled={!imageUri || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator
              color="#ffffff"
              size="small"
              style={styles.buttonIcon}
            />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          )}
          <Text style={styles.buttonText}>
            {isProcessing ? "Processing..." : "Use This Image"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  floatingBackButton: {
    position: "absolute",
    left: 15,
    // top is set dynamically using insets.top
    zIndex: 10,
    backgroundColor: "rgba(30, 41, 59, 0.7)", // slate-800 with opacity
    padding: 10,
    borderRadius: 25, // Makes it circular
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    backgroundColor: "#1e293b",
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButtonIcon: {
    color: "#e2e8f0",
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorIcon: {
    color: "#ef4444",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 25,
  },
  mtLarge: {
    marginTop: 25,
  },
});
