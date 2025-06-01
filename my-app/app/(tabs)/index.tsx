import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Ionicons } from "@expo/vector-icons";
import { saveApiKey, getApiKey, deleteApiKey } from "@/services/apiKeyService";
import ApiKeySetup from "@/components/ui/ApiKeySetup";

export default function HomeScreen() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoadingKey(true);
      try {
        const key = await getApiKey();
        setStoredApiKey(key);
        if (key) {
          setApiKeyInput(key);
        }
      } catch (error) {
        console.error("Failed to load API key:", error);
        Alert.alert("Error", "Could not load API key from storage.");
      } finally {
        setIsLoadingKey(false);
      }
    };
    loadApiKey();
  }, []);

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert("API Key Required", "Please enter your Gemini API Key.");
      return;
    }
    setIsSavingKey(true);
    try {
      await saveApiKey(apiKeyInput.trim());
      setStoredApiKey(apiKeyInput.trim());
      Alert.alert("Success", "API Key saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save API Key. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

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
      setApiKeyInput(tempApiKey.trim());
      setShowSettingsModal(false);
      Alert.alert("Success", "API Key updated successfully!");
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
            console.log("Delete API key button pressed");
            setIsSavingKey(true);
            try {
              console.log("Calling deleteApiKey...");
              await deleteApiKey();
              console.log("API key deleted from storage, updating state...");

              // Reset all API key related state
              setStoredApiKey(null);
              setApiKeyInput("");
              setTempApiKey("");
              setShowSettingsModal(false);

              console.log("State updated successfully");

              // Show success message and then the user will see the setup component
              Alert.alert(
                "Success",
                "API Key deleted successfully. You'll need to set up a new API key to use the app.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Ensure the component re-renders to show ApiKeySetup
                      console.log("User acknowledged deletion");
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error in delete process:", error);
              Alert.alert(
                "Error",
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
    if (!storedApiKey) {
      Alert.alert(
        "API Key Required",
        "Please set your Gemini API Key first before scanning a receipt.",
        [{ text: "OK" }]
      );
      return;
    }
    router.push("/camera");
  };

  const handleApiKeySaved = (apiKey: string) => {
    setStoredApiKey(apiKey);
    setApiKeyInput(apiKey);
  };

  const features = [
    {
      icon: "camera-outline" as const,
      title: "Scan Receipt",
      description: "Take a photo of your receipt with our easy-to-use camera",
    },
    {
      icon: "receipt-outline" as const,
      title: "Process Receipt",
      description: "Our AI extracts all items and prices automatically",
    },
    {
      icon: "create-outline" as const,
      title: "Review Items",
      description: "Review the items and prices and add any missing items",
    },
    {
      icon: "share-social-outline" as const,
      title: "Share Results",
      description: "Share a link with your friends to split the bill",
    },
  ];

  if (isLoadingKey) {
    return (
      <ParallaxScrollView>
        <View className="items-center justify-center flex-1 mt-20">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-600 mt-4">Loading...</Text>
        </View>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView>
      <View className="items-center mt-4 px-4">
        {/* Header with settings button when API key exists */}
        {storedApiKey && (
          <View className="w-full flex-row justify-end mb-4">
            <TouchableOpacity
              className="p-2 rounded-full bg-slate-100"
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        <View className="w-20 h-20 mb-4 rounded-full bg-sky-100 items-center justify-center">
          <Ionicons name="receipt-outline" size={40} color="#0ea5e9" />
        </View>

        <ThemedText className="text-3xl font-bold mb-2 text-center text-slate-800">
          Cash Splitter
        </ThemedText>

        <ThemedText className="text-center text-lg mb-6 opacity-80 text-slate-600">
          Take a photo of your receipt and let AI split the costs.
        </ThemedText>

        {!storedApiKey ? (
          <ApiKeySetup onApiKeySaved={handleApiKeySaved} />
        ) : (
          <>
            <TouchableOpacity
              className="w-full py-4 px-8 rounded-full items-center justify-center bg-sky-400 active:bg-sky-500 shadow-md mb-8"
              onPress={handleScanPress}
            >
              <Text className="text-gray-800 text-lg font-bold">
                Scan Receipt
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View className="w-full">
          <ThemedText className="font-bold text-xl mb-4 text-slate-800">
            How it Works
          </ThemedText>

          {features.map((feature, index) => (
            <View key={index} className="flex-row mb-5 items-start">
              <View className="w-12 h-12 rounded-full bg-sky-100 items-center justify-center mr-4 shrink-0">
                <Ionicons name={feature.icon} size={24} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <ThemedText className="font-bold text-base text-slate-700">
                  {feature.title}
                </ThemedText>
                <ThemedText className="text-sm opacity-70 text-slate-600">
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-slate-800">
                API Key Settings
              </Text>
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowSettingsModal(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-slate-600 mb-4">
              Update your Google Gemini API Key
            </Text>

            {/* AI Studio Link */}
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 mb-4 bg-green-50 border border-green-200 rounded-lg"
              onPress={async () => {
                const url = "https://aistudio.google.com/app/apikey";
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert(
                    "Cannot Open Link",
                    `Please manually visit: ${url}`
                  );
                }
              }}
            >
              <Ionicons name="open-outline" size={20} color="#10b981" />
              <Text className="text-green-700 font-semibold ml-2">
                Get API Key from AI Studio
              </Text>
            </TouchableOpacity>

            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-4 text-base text-slate-900"
              placeholder="Enter your Google Gemini API Key"
              value={tempApiKey}
              onChangeText={setTempApiKey}
              secureTextEntry={true}
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${
                  isSavingKey ? "bg-sky-300" : "bg-sky-500"
                }`}
                onPress={handleUpdateKey}
                disabled={isSavingKey}
              >
                {isSavingKey ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold">Update Key</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg items-center justify-center bg-red-500"
                onPress={handleDeleteKeyConfirm}
                disabled={isSavingKey}
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={16} color="white" />
                  <Text className="text-white font-bold ml-1">Delete Key</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Ionicons name="shield-checkmark" size={16} color="#f59e0b" />
              <Text className="text-xs text-amber-800 ml-2 flex-1">
                Your API key is stored securely on this device only
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}
