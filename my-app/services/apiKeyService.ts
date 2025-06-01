import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_KEY_STORAGE_KEY = "user_gemini_api_key";

export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      // Use SecureStore for iOS/Android
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
    }
    console.log("API Key saved successfully.");
  } catch (error) {
    console.error("Error saving API key:", error);
    throw new Error("Failed to save API key.");
  }
};

export const getApiKey = async (): Promise<string | null> => {
  try {
    let apiKey: string | null;

    if (Platform.OS === "web") {
      // Use localStorage for web
      apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    } else {
      // Use SecureStore for iOS/Android
      apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    }

    if (apiKey) {
      console.log("API Key retrieved successfully.");
    } else {
      console.log("No API Key found in storage.");
    }
    return apiKey;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw new Error("Failed to retrieve API key.");
  }
};

export const deleteApiKey = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
      // Use SecureStore for iOS/Android
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    }
    console.log("API Key deleted successfully.");
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw new Error("Failed to delete API key.");
  }
};
