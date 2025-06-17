import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProcessingErrorViewProps {
  error: string;
  onRetry: () => void;
  onAddManually: () => void;
  onGoToSettings: () => void;
  onRetakePhoto: () => void;
}

export default function ProcessingErrorView({
  error,
  onRetry,
  onAddManually,
  onGoToSettings,
  onRetakePhoto,
}: ProcessingErrorViewProps) {
  const isApiKeyError =
    error.includes("API Key not found") || error.includes("Invalid API key");
  const isNetworkError =
    error.includes("network") ||
    error.includes("Network") ||
    error.includes("timeout");

  const getErrorIcon = () => {
    if (isApiKeyError) return "key-outline";
    if (isNetworkError) return "wifi-outline";
    return "alert-circle-outline";
  };

  const getErrorTitle = () => {
    if (isApiKeyError) return "API Key Required";
    if (isNetworkError) return "Connection Issue";
    return "Processing Failed";
  };

  const getErrorMessage = () => {
    if (isApiKeyError) {
      return "A valid Google Gemini API Key is needed to process receipts. Please set it up in the app settings.";
    }
    if (isNetworkError) {
      return "Unable to connect to the processing service. Please check your internet connection and try again.";
    }
    return "We couldn't automatically extract items from your receipt. You can try again or add items manually.";
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="bg-red-50 rounded-2xl p-8 items-center max-w-sm w-full">
        <Ionicons
          name={getErrorIcon()}
          size={64}
          color="#ef4444"
          className="mb-6"
        />

        <Text className="text-2xl font-bold text-red-800 mb-3 text-center">
          {getErrorTitle()}
        </Text>

        <Text className="text-red-700 text-center mb-8 leading-6">
          {getErrorMessage()}
        </Text>

        {/* Primary Action */}
        <TouchableOpacity
          className="bg-blue-600 px-6 py-4 rounded-xl flex-row items-center w-full justify-center mb-3"
          onPress={isApiKeyError ? onGoToSettings : onRetry}
        >
          <Ionicons
            name={isApiKeyError ? "settings-outline" : "refresh-outline"}
            size={20}
            color="white"
            className="mr-3"
          />
          <Text className="text-white font-semibold text-lg">
            {isApiKeyError ? "Go to Settings" : "Try Again"}
          </Text>
        </TouchableOpacity>

        {/* Secondary Actions */}
        {!isApiKeyError && (
          <>
            <TouchableOpacity
              className="bg-green-600 px-6 py-3 rounded-xl flex-row items-center w-full justify-center mb-3"
              onPress={onAddManually}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="white"
                className="mr-3"
              />
              <Text className="text-white font-semibold">
                Add Items Manually
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-600 px-6 py-3 rounded-xl flex-row items-center w-full justify-center"
              onPress={onRetakePhoto}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color="white"
                className="mr-3"
              />
              <Text className="text-white font-semibold">Retake Photo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Help Text */}
      {!isApiKeyError && (
        <Text className="text-slate-500 text-center mt-6 px-4 text-sm leading-5">
          Tip: Make sure your receipt is well-lit and all text is clearly
          visible for better processing results.
        </Text>
      )}
    </View>
  );
}
