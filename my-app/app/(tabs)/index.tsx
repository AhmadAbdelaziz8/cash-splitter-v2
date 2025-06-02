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
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveApiKey, getApiKey, deleteApiKey } from "@/services/apiKeyService";
import ApiKeySetup from "@/components/ui/ApiKeySetup";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function HomeScreen() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoadingKey(true);
      try {
        const key = await getApiKey();
        setStoredApiKey(key);
        if (key) {
          setApiKeyInput(key);
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
            setIsSavingKey(true);
            try {
              await deleteApiKey();
              setStoredApiKey(null);
              setApiKeyInput("");
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
    setApiKeyInput(apiKey);
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
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-4">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-slate-600 dark:text-slate-400 mt-4 text-lg">
          Loading Secure Storage...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      contentContainerStyle={styles.scrollViewContent}
    >
      <View className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-4xl font-bold text-slate-800 dark:text-slate-100">
            Cash Splitter
          </Text>
          {storedApiKey && (
            <TouchableOpacity
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700"
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={28} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        {!storedApiKey ? (
          <View className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl">
            <ApiKeySetup onApiKeySaved={handleApiKeySaved} />
          </View>
        ) : (
          <View className="mb-12">
            <View className="items-center mb-8">
              <View className="w-28 h-28 mb-6 rounded-full bg-sky-100 dark:bg-sky-900 items-center justify-center border-4 border-sky-200 dark:border-sky-700">
                <Ionicons
                  name="scan-outline"
                  size={60}
                  className="text-sky-500 dark:text-sky-400"
                />
              </View>
              <Text className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2 text-center">
                Ready to Scan!
              </Text>
              <Text className="text-lg text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
                Your API key is set. Capture a receipt to begin splitting
                expenses with ease.
              </Text>
              <TouchableOpacity
                className="w-full max-w-xs py-4 px-8 rounded-full items-center justify-center bg-sky-500 active:bg-sky-600 shadow-lg"
                onPress={handleScanPress}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    className="text-white mr-2"
                  />
                  <Text className="text-white text-lg font-bold">
                    Scan New Receipt
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mt-12">
          <Text className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
            How It Works
          </Text>
          <Text className="text-lg text-slate-500 dark:text-slate-400 mb-10 text-center max-w-xl mx-auto">
            Splitting bills is now simpler than ever. Just follow these easy
            steps.
          </Text>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <View
                key={index}
                className="flex-row p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg items-start space-x-5"
              >
                <View className="flex-shrink-0 w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900 items-center justify-center">
                  <Ionicons
                    name={feature.icon}
                    size={30}
                    className="text-sky-500 dark:text-sky-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-xl text-slate-700 dark:text-slate-200 mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-base text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 items-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Cash Splitter v1.0 - Effortless Bill Management
          </Text>
        </View>
      </View>

      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-50 dark:bg-slate-800 rounded-t-3xl p-6 shadow-2xl">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                API Key Settings
              </Text>
              <TouchableOpacity
                className="p-2 rounded-full active:bg-slate-200 dark:active:bg-slate-700"
                onPress={() => setShowSettingsModal(false)}
              >
                <Ionicons
                  name="close"
                  size={28}
                  className="text-slate-600 dark:text-slate-300"
                />
              </TouchableOpacity>
            </View>

            <Text className="text-base text-slate-600 dark:text-slate-300 mb-2">
              Your Google Gemini API Key for receipt processing.
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 mb-5 bg-green-500 active:bg-green-600 rounded-lg shadow"
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
              <Ionicons
                name="open-outline"
                size={20}
                className="text-white mr-2"
              />
              <Text className="text-white font-semibold text-base">
                Get/Manage API Key at AI Studio
              </Text>
            </TouchableOpacity>

            <TextInput
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 mb-5 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Enter or update your API Key"
              value={tempApiKey}
              onChangeText={setTempApiKey}
              secureTextEntry={true}
              autoCapitalize="none"
            />

            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg items-center justify-center shadow-md ${
                  isSavingKey
                    ? "bg-sky-300 dark:bg-sky-700"
                    : "bg-sky-500 dark:bg-sky-600 active:bg-sky-600 dark:active:bg-sky-500"
                }`}
                onPress={handleUpdateKey}
                disabled={isSavingKey || tempApiKey === storedApiKey}
              >
                {isSavingKey ? (
                  <ActivityIndicator
                    color={colorScheme === 'dark' ? "#e2e8f0" : "#ffffff"}
                    size="small"
                  />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Update Key
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg items-center justify-center shadow-md ${
                  isSavingKey
                    ? "bg-red-300 dark:bg-red-800"
                    : "bg-red-600 dark:bg-red-700 active:bg-red-700 dark:active:bg-red-600"
                }`}
                onPress={handleDeleteKeyConfirm}
                disabled={isSavingKey || !storedApiKey}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    className="text-white mr-1.5"
                  />
                  <Text className="text-white font-bold text-base">
                    Delete Key
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center p-3 bg-amber-100 dark:bg-amber-800/50 border border-amber-300 dark:border-amber-700 rounded-lg">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                className="text-amber-600 dark:text-amber-400"
              />
              <Text className="text-sm text-amber-700 dark:text-amber-300 ml-2 flex-1">
                Your API key is stored securely on this device and never shared.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
});
