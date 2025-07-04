import React, { useState } from "react";
import { View, Image, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImagePreviewProps {
  imageUri: string;
  onImageLoad?: () => void;
  onImageError?: (error: any) => void;
}

export default function ImagePreview({
  imageUri,
  onImageLoad,
  onImageError,
}: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    console.log("ImagePreview: Image loaded successfully");
    setLoading(false);
    setError(false);
    onImageLoad?.();
  };

  const handleImageError = (err: any) => {
    console.error("ImagePreview: Image load error:", err);
    setLoading(false);
    setError(true);
    onImageError?.(err);
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-gray-100 rounded-xl">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading image...</Text>
        </View>
      )}

      {error && (
        <View className="absolute inset-0 justify-center items-center bg-gray-100 rounded-xl">
          <Ionicons name="image-outline" size={64} color="#9ca3af" />
          <Text className="mt-2 text-gray-600 text-center">
            Failed to load image
          </Text>
          <Text className="mt-1 text-gray-500 text-sm text-center px-4">
            Please try taking another photo
          </Text>
        </View>
      )}

      <Image
        source={{ uri: imageUri }}
        className="w-full h-full rounded-xl border-2 border-slate-200"
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="Preview of captured receipt"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: loading || error ? 0 : 1 }}
      />
    </View>
  );
}
