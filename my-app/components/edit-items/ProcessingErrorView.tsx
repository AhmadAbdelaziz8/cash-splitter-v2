import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReceiptParsingError } from "@/config/geminiConfig";

interface ProcessingErrorViewProps {
  error: string;
  errorType?: ReceiptParsingError;
  onRetry: () => void;
  onAddManually: () => void;
  onGoToSettings: () => void;
  onRetakePhoto: () => void;
}

export default function ProcessingErrorView({
  error,
  errorType,
  onRetry,
  onAddManually,
  onGoToSettings,
  onRetakePhoto,
}: ProcessingErrorViewProps) {
  const isApiKeyError =
    errorType === ReceiptParsingError.API_ERROR ||
    error.includes("API Key not found") ||
    error.includes("Invalid API key");

  const isNetworkError = errorType === ReceiptParsingError.NETWORK_ERROR;
  const isNoItemsFound = errorType === ReceiptParsingError.NO_ITEMS_FOUND;
  const isUnreadableImage = errorType === ReceiptParsingError.UNREADABLE_IMAGE;
  const isInvalidReceipt = errorType === ReceiptParsingError.INVALID_RECEIPT;

  const getErrorIcon = () => {
    if (isApiKeyError) return "key-outline";
    if (isNetworkError) return "wifi-outline";
    if (isNoItemsFound) return "receipt-outline";
    if (isUnreadableImage) return "camera-outline";
    if (isInvalidReceipt) return "document-outline";
    return "alert-circle-outline";
  };

  const getErrorTitle = () => {
    if (isApiKeyError) return "API Key Required";
    if (isNetworkError) return "Connection Issue";
    if (isNoItemsFound) return "No Items Found";
    if (isUnreadableImage) return "Image Not Clear";
    if (isInvalidReceipt) return "Invalid Receipt";
    return "Processing Failed";
  };

  const getErrorMessage = () => {
    if (isApiKeyError) {
      return "A valid Google Gemini API Key is needed to process receipts. Please set it up in the app settings.";
    }
    if (isNetworkError) {
      return "Unable to connect to the processing service. Please check your internet connection and try again.";
    }
    if (isNoItemsFound) {
      return "We couldn't find any items in this receipt image. The image might be too blurry, or it might not be a receipt. Try taking a clearer photo or add items manually.";
    }
    if (isUnreadableImage) {
      return "The image is not clear enough to read. Please take a new photo with better lighting and ensure all text is visible.";
    }
    if (isInvalidReceipt) {
      return "This doesn't appear to be a valid receipt image. Please make sure you're photographing a receipt with itemized purchases.";
    }
    return "We couldn't automatically extract items from your receipt. You can try again or add items manually.";
  };

  const getErrorColor = () => {
    if (isNoItemsFound || isUnreadableImage || isInvalidReceipt) {
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        icon: "#f59e0b",
        textSecondary: "text-amber-700",
      };
    }
    return {
      bg: "bg-red-50",
      text: "text-red-800",
      icon: "#ef4444",
      textSecondary: "text-red-700",
    };
  };

  const colors = getErrorColor();

  const getPrimaryAction = () => {
    if (isApiKeyError) {
      return {
        label: "Go to Settings",
        icon: "settings-outline" as const,
        action: onGoToSettings,
        color: "bg-blue-600",
      };
    }
    if (isNoItemsFound || isUnreadableImage || isInvalidReceipt) {
      return {
        label: "Retake Photo",
        icon: "camera-outline" as const,
        action: onRetakePhoto,
        color: "bg-blue-600",
      };
    }
    return {
      label: "Try Again",
      icon: "refresh-outline" as const,
      action: onRetry,
      color: "bg-blue-600",
    };
  };

  const primaryAction = getPrimaryAction();

  const getHelpText = () => {
    if (isApiKeyError) return null;
    if (isNoItemsFound) {
      return "📸 Tips: Ensure the receipt is flat, well-lit, and all items are visible in the photo.";
    }
    if (isUnreadableImage) {
      return "💡 Tips: Use good lighting, avoid shadows, and make sure the text is sharp and readable.";
    }
    if (isInvalidReceipt) {
      return "🧾 Make sure you're photographing a receipt that shows individual items with prices.";
    }
    if (isNetworkError) {
      return "📶 Check your WiFi or mobile data connection and try again.";
    }
    return "💡 Tip: Make sure your receipt is well-lit and all text is clearly visible for better processing results.";
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View
        className={`${colors.bg} rounded-2xl p-8 items-center max-w-sm w-full`}
      >
        <Ionicons
          name={getErrorIcon()}
          size={64}
          color={colors.icon}
          className="mb-6"
        />

        <Text className={`text-2xl font-bold ${colors.text} mb-3 text-center`}>
          {getErrorTitle()}
        </Text>

        <Text className={`${colors.textSecondary} text-center mb-8 leading-6`}>
          {getErrorMessage()}
        </Text>

        {/* Primary Action */}
        <TouchableOpacity
          className={`${primaryAction.color} px-6 py-4 rounded-xl flex-row items-center w-full justify-center mb-3`}
          onPress={primaryAction.action}
        >
          <Ionicons
            name={primaryAction.icon}
            size={20}
            color="white"
            className="mr-3"
          />
          <Text className="text-white font-semibold text-lg">
            {primaryAction.label}
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

            {/* Show retry option for network errors or if primary action is not retry */}
            {(isNetworkError || primaryAction.icon !== "refresh-outline") && (
              <TouchableOpacity
                className="bg-slate-600 px-6 py-3 rounded-xl flex-row items-center w-full justify-center"
                onPress={onRetry}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="white"
                  className="mr-3"
                />
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Help Text */}
      {getHelpText() && (
        <Text className="text-slate-500 text-center mt-6 px-4 text-sm leading-5">
          {getHelpText()}
        </Text>
      )}
    </View>
  );
}
