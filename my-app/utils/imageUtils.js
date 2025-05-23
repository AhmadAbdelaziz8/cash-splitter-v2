import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export const parseImage = async (imageUri) => {
  if (!imageUri) {
    throw new Error("Image URI is required");
  }

  try {
    // Web environment
    if (Platform.OS === "web") {
      // For web, we'll just pass the URI through since we can't use FileSystem
      // The imageUri in web is already usable for display
      console.log("Web environment detected, using URI directly");
      return imageUri;
    }
    // Native environment (iOS/Android)
    else {
      console.log(
        `Native environment (${Platform.OS}) detected, using FileSystem`
      );
      const image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return image;
    }
  } catch (error) {
    console.error("Error parsing image:", error);
    throw error;
  }
};
