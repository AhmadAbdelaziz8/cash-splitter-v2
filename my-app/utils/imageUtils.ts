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
      // Ensure the document directory exists
      const docDir = FileSystem.documentDirectory + "images/";
      await FileSystem.makeDirectoryAsync(docDir, { intermediates: true });

      const newImageUri = docDir + Date.now() + "_" + imageUri.split("/").pop();
      
      await FileSystem.copyAsync({
        from: imageUri,
        to: newImageUri,
      });

      const image = await FileSystem.readAsStringAsync(newImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return image;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in parseImage:", error); // Added for more detailed logging
    throw new Error(`Failed to parse image: ${errorMessage}`);
  }
};
