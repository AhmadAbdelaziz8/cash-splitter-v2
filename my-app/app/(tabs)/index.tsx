import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { View, Text, Alert, ActivityIndicator, ScrollView } from "react-native";
import { saveApiKey, getApiKey, deleteApiKey } from "@/services/apiKeyService";
import ApiKeySetup from "@/components/api-key/ApiKeySetup";
import HomeHeader from "@/components/home/HomeHeader";
import ScanSection from "@/components/home/ScanSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ApiKeyModal from "@/components/home/ApiKeyModal";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ColorScheme } from "@/types";
import { MESSAGES } from "@/constants/AppConstants";

export default function HomeScreen() {
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const colorScheme = useColorScheme() as ColorScheme;

  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoadingKey(true);
      try {
        const key = await getApiKey();
        setStoredApiKey(key);
        if (key) {
          setTempApiKey(key);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load API key from storage.");
      } finally {
        setIsLoadingKey(false);
      }
    };
    loadApiKey();
  }, []);

  const handleSettingsPress = () => {
    setTempApiKey(storedApiKey || "");
    setShowSettingsModal(true);
  };

  const handleUpdateKey = async () => {
    if (!tempApiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key.");
      return;
    }
    setIsSavingKey(true);
    try {
      await saveApiKey(tempApiKey.trim());
      setStoredApiKey(tempApiKey.trim());
      setShowSettingsModal(false);
      Alert.alert("Success", MESSAGES.SUCCESS.API_KEY_SAVED);
    } catch (error) {
      Alert.alert("Error", "Failed to update API Key. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteKeyConfirm = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your API Key? The app will not function without it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSavingKey(true);
            try {
              await deleteApiKey();
              setStoredApiKey(null);
              setTempApiKey("");
              setShowSettingsModal(false);
              Alert.alert(
                "API Key Deleted",
                "Your API Key has been successfully deleted. Please set up a new one to continue using the app."
              );
            } catch (error) {
              Alert.alert(
                "Delete Failed",
                `Failed to delete API Key: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            } finally {
              setIsSavingKey(false);
            }
          },
        },
      ]
    );
  };

  const handleScanPress = () => {
    router.push("/camera");
  };

  const handleApiKeySaved = (apiKey: string) => {
    setStoredApiKey(apiKey);
    setTempApiKey(apiKey);
  };

  const features = [
    {
      icon: "camera-outline" as const,
      title: "Scan Receipts Instantly",
      description: "Use your camera to capture receipt details in seconds.",
    },
    {
      icon: "receipt-outline" as const,
      title: "AI-Powered Item Extraction",
      description:
        "Our smart AI automatically identifies items, prices, and totals.",
    },
    {
      icon: "create-outline" as const,
      title: "Edit & Verify with Ease",
      description: "Review and adjust extracted details for perfect accuracy.",
    },
    {
      icon: "share-social-outline" as const,
      title: "Split & Share Bills",
      description:
        "Generate a shareable link for friends to settle up effortlessly.",
    },
  ];

  if (isLoadingKey) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-slate-600 mt-6 text-lg">
          Loading Secure Storage...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        <HomeHeader
          storedApiKey={storedApiKey}
          onSettingsPress={handleSettingsPress}
        />

        {!storedApiKey ? (
          <View className="bg-white p-8 rounded-2xl shadow-xl">
            <ApiKeySetup onApiKeySaved={handleApiKeySaved} />
          </View>
        ) : (
          <ScanSection onScanPress={handleScanPress} />
        )}

        <FeaturesSection features={features} />
      </View>

      <ApiKeyModal
        visible={showSettingsModal}
        tempApiKey={tempApiKey}
        isSavingKey={isSavingKey}
        colorScheme={colorScheme}
        storedApiKey={storedApiKey}
        onClose={() => setShowSettingsModal(false)}
        onTempApiKeyChange={setTempApiKey}
        onUpdateKey={handleUpdateKey}
        onDeleteKey={handleDeleteKeyConfirm}
      />
    </ScrollView>
  );
}
