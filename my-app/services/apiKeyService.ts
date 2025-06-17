import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_KEY_STORAGE_KEY = "user_gemini_api_key";

export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    // Sanitize the API key: allow only letters, numbers, hyphens, and underscores
    const sanitizedApiKey = apiKey.replace(/[^a-zA-Z0-9_\-]/g, "");

    if (Platform.OS === "web") {
      localStorage.setItem(API_KEY_STORAGE_KEY, sanitizedApiKey);
    } else {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, sanitizedApiKey);
    }
  } catch (error) {
    throw new Error("Failed to save API key.");
  }
};

export const getApiKey = async (): Promise<string | null> => {
  try {
    let apiKey: string | null;

    if (Platform.OS === "web") {
      apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    } else {
      apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    }

    return apiKey;
  } catch (error) {
    throw new Error("Failed to retrieve API key.");
  }
};

export const deleteApiKey = async (): Promise<void> => {
  try {
    if (__DEV__) {
      console.log(
        `[deleteApiKey] Starting deletion on platform: ${Platform.OS}`
      );
    }

    if (Platform.OS === "web") {
      const existingKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (__DEV__) {
        console.log(
          `[deleteApiKey] Web - existing key: ${
            existingKey ? "EXISTS" : "NOT FOUND"
          }`
        );
      }

      // Multiple attempts to ensure deletion on web
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      localStorage.setItem(API_KEY_STORAGE_KEY, ""); // Clear any cached value
      localStorage.removeItem(API_KEY_STORAGE_KEY); // Remove again

      // Force browser to flush localStorage
      try {
        localStorage.setItem("__test__", "test");
        localStorage.removeItem("__test__");
      } catch (e) {
        // Ignore test errors
      }

      const afterDelete = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (__DEV__) {
        console.log(
          `[deleteApiKey] Web - after deletion: ${
            afterDelete ? "STILL EXISTS" : "DELETED"
          }`
        );
      }
    } else {
      const existingKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (__DEV__) {
        console.log(
          `[deleteApiKey] Native - existing key: ${
            existingKey ? "EXISTS" : "NOT FOUND"
          }`
        );
      }
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
      const afterDelete = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (__DEV__) {
        console.log(
          `[deleteApiKey] Native - after deletion: ${
            afterDelete ? "STILL EXISTS" : "DELETED"
          }`
        );
      }
    }

    if (__DEV__) {
      console.log("[deleteApiKey] Deletion completed successfully");
    }
  } catch (error) {
    if (__DEV__) {
      console.log("[deleteApiKey] Error during deletion:", error);
    }
    throw new Error(
      `Failed to delete API key: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
