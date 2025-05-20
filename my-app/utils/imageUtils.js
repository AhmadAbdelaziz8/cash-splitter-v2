import * as FileSystem from "expo-file-system";

export const parseImage = async (imageUri) => {
  if (!imageUri) {
    throw new Error("Image URI is required");
  }

  try {
    const image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return image;
  } catch (error) {
    console.error("Error parsing image:", error);
    throw error;
  }
};
