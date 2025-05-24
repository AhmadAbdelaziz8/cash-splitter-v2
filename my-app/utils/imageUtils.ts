import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export const parseImage = async (imageUri: string): Promise<string> => {
  if (!imageUri) {
    throw new Error("Image URI is required");
  }

  try {
    // Web environment
    if (Platform.OS === "web") {
      // For web, we'll just pass the URI through since we can't use FileSystem
      // The imageUri in web is already usable for display
      return imageUri;
    }
    // Native environment (iOS/Android)
    else {
      const image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return image;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse image: ${errorMessage}`);
  }
};
