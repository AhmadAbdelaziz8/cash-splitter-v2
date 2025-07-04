import * as FileSystem from "expo-file-system";

export const deleteImageFile = async (uri: string): Promise<void> => {
  if (!uri || !uri.startsWith("file://")) {
    return;
  }
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    if (__DEV__) {
      console.log("FILE_UTILS: Deleted temporary file:", uri);
    }
  } catch (error) {
    if (__DEV__) {
      console.error("FILE_UTILS: Failed to delete file:", uri, error);
    }
  }
};
