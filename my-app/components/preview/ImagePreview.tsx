import React from "react";
import { View, Image } from "react-native";

interface ImagePreviewProps {
  imageUri: string;
}

export default function ImagePreview({ imageUri }: ImagePreviewProps) {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Image
        source={{ uri: imageUri }}
        className="w-full h-full rounded-xl border-2 border-slate-200"
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="Preview of captured receipt"
      />
    </View>
  );
}
 