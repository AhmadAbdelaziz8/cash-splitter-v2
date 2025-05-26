import { useState } from "react";
import { Share, Alert, Linking, Clipboard } from "react-native";
import { ReceiptItem } from "@/contexts/ReceiptContext";
import { webSharingService, WebUrlResult } from "@/services/webSharingService";
import { MESSAGES } from "@/constants/AppConstants";

export interface UseWebSharingReturn {
  isGeneratingUrl: boolean;
  generateAndShareWebUrl: (items: ReceiptItem[]) => Promise<void>;
  generatePersonalizedUrl: (
    items: ReceiptItem[],
    personName: string,
    selectedItems: string[]
  ) => Promise<void>;
  copyUrlToClipboard: (items: ReceiptItem[]) => Promise<boolean>;
  openInBrowser: (items: ReceiptItem[]) => Promise<void>;
}

export const useWebSharing = (): UseWebSharingReturn => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  const generateAndShareWebUrl = async (
    items: ReceiptItem[]
  ): Promise<void> => {
    setIsGeneratingUrl(true);

    try {
      const result: WebUrlResult = webSharingService.generateWebUrl(items);

      if (result.success && result.url) {
        // Try to share the web URL
        await Share.share({
          message: `Check out this bill split: ${result.url}`,
          url: result.url,
          title: "Cash Splitter - Bill Split",
        });

        Alert.alert("Success", MESSAGES.WEB_URL_GENERATED);
      } else {
        // Fallback to text sharing
        const fallbackMessage =
          result.fallbackMessage || "Failed to generate web URL";

        await Share.share({
          message: fallbackMessage,
          title: "Cash Splitter - Bill Split",
        });

        Alert.alert("Info", MESSAGES.WEB_URL_TOO_LONG);
      }
    } catch (error) {
      console.error("Error sharing web URL:", error);
      Alert.alert("Error", MESSAGES.WEB_URL_ERROR);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const generatePersonalizedUrl = async (
    items: ReceiptItem[],
    personName: string,
    selectedItems: string[]
  ): Promise<void> => {
    setIsGeneratingUrl(true);

    try {
      const result = webSharingService.generatePersonalizedUrl(
        items,
        personName,
        selectedItems
      );

      if (result.success && result.url) {
        await Share.share({
          message: `Hi ${personName}! Here's your share of the bill: ${result.url}`,
          url: result.url,
          title: `Cash Splitter - ${personName}'s Bill`,
        });
      } else {
        throw new Error(result.error || "Failed to generate personalized URL");
      }
    } catch (error) {
      console.error("Error sharing personalized URL:", error);
      Alert.alert("Error", "Failed to generate personalized sharing link");
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const copyUrlToClipboard = async (items: ReceiptItem[]): Promise<boolean> => {
    try {
      const result = webSharingService.generateWebUrl(items);

      if (result.success && result.url) {
        Clipboard.setString(result.url);
        Alert.alert("Copied", "Web link copied to clipboard!");
        return true;
      } else {
        const fallbackMessage =
          result.fallbackMessage || "Failed to generate URL";
        Clipboard.setString(fallbackMessage);
        Alert.alert("Copied", "Bill summary copied to clipboard!");
        return false;
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy to clipboard");
      return false;
    }
  };

  const openInBrowser = async (items: ReceiptItem[]): Promise<void> => {
    try {
      const result = webSharingService.generateWebUrl(items);

      if (result.success && result.url) {
        const supported = await Linking.canOpenURL(result.url);
        if (supported) {
          await Linking.openURL(result.url);
        } else {
          Alert.alert("Error", "Cannot open URL in browser");
        }
      } else {
        Alert.alert("Error", "Failed to generate web URL");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Failed to open in browser");
    }
  };

  return {
    isGeneratingUrl,
    generateAndShareWebUrl,
    generatePersonalizedUrl,
    copyUrlToClipboard,
    openInBrowser,
  };
};
