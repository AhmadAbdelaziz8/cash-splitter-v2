import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseImage } from "../utils/imageUtils";
import { useReceipt } from "@/contexts/ReceiptContext";

import PreviewHeader from "@/components/preview/PreviewHeader";
import ImagePreview from "@/components/preview/ImagePreview";
import PreviewActions from "@/components/preview/PreviewActions";
import ErrorState from "@/components/preview/ErrorState";

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
      if (__DEV__) {
        console.error("Error processing image for preview:", error);
      }
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
    return <ErrorState onRetake={handleRetake} />;
  }

  return (
    <View style={{ paddingBottom: insets.bottom }} className="flex-1 bg-white">
      <PreviewHeader
        onBackPress={handleRetake}
        disabled={isProcessing}
        topInset={insets.top}
      />

      <ImagePreview imageUri={imageUri} />

      <PreviewActions
        onRetake={handleRetake}
        onProceed={handleProceed}
        isProcessing={isProcessing}
        hasImage={!!imageUri}
      />
    </View>
  );
}
