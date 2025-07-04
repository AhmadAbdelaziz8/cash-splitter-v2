import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseImage } from "../utils/imageUtils";
import { useReceipt } from "@/contexts/ReceiptContext";

import PreviewHeader from "@/components/preview/PreviewHeader";
import ImagePreview from "@/components/preview/ImagePreview";
import PreviewActions from "@/components/preview/PreviewActions";
import ErrorState from "@/components/preview/ErrorState";
import { deleteImageFile } from "@/utils/fileUtils";

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setImageUri: setContextImageUri, setImageBase64 } = useReceipt();
  const insets = useSafeAreaInsets();

  // Debug logging
  useEffect(() => {
    console.log("PREVIEW_DEBUG: Screen mounted with imageUri:", imageUri);
  }, [imageUri]);

  const handleRetake = async () => {
    console.log(
      "PREVIEW_DEBUG: Retake button pressed, isProcessing:",
      isProcessing
    );
    if (isProcessing) {
      console.log("PREVIEW_DEBUG: Still processing, ignoring retake");
      return;
    }

    if (imageUri) {
      await deleteImageFile(imageUri);
    }

    console.log("PREVIEW_DEBUG: Navigating back to camera");
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
    if (isProcessing) {
      console.log("PREVIEW_DEBUG: Already processing, ignoring proceed");
      return;
    }

    console.log("PREVIEW_DEBUG: Starting image processing");
    setIsProcessing(true);
    try {
      setContextImageUri(imageUri);
      const base64Image = await parseImage(imageUri);
      setImageBase64(base64Image);
      console.log(
        "PREVIEW_DEBUG: Image processed successfully, navigating to edit screen"
      );
      router.push("/EditItemsScreen");
    } catch (error) {
      console.error("PREVIEW_DEBUG: Error processing image:", error);
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
    console.log("PREVIEW_DEBUG: No imageUri provided");
    return <ErrorState onRetake={handleRetake} />;
  }

  return (
    <View style={{ paddingBottom: insets.bottom }} className="flex-1 bg-white">
      <PreviewHeader
        onBackPress={handleRetake}
        disabled={isProcessing}
        topInset={insets.top}
      />

      <ImagePreview
        imageUri={imageUri}
        onImageLoad={() => {
          console.log("PREVIEW_DEBUG: Image loaded successfully");
          setImageLoaded(true);
        }}
        onImageError={(error) => {
          console.error("PREVIEW_DEBUG: Image load error:", error);
          setImageLoaded(false);
        }}
      />

      <PreviewActions
        onRetake={handleRetake}
        onProceed={handleProceed}
        isProcessing={isProcessing}
        hasImage={!!imageUri && imageLoaded}
      />
    </View>
  );
}
