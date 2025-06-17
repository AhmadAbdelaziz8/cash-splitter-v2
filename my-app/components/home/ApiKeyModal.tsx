import React from "react";
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
import { Ionicons } from "@expo/vector-icons";

interface ApiKeyModalProps {
  visible: boolean;
  tempApiKey: string;
  isSavingKey: boolean;
  colorScheme: "light" | "dark" | null;
  storedApiKey: string | null;
  onClose: () => void;
  onTempApiKeyChange: (text: string) => void;
  onUpdateKey: () => void;
  onDeleteKey: () => void;
}

export default function ApiKeyModal({
  visible,
  tempApiKey,
  isSavingKey,
  colorScheme,
  storedApiKey,
  onClose,
  onTempApiKeyChange,
  onUpdateKey,
  onDeleteKey,
}: ApiKeyModalProps) {
  const handleOpenApiStudio = async () => {
    const url = "https://aistudio.google.com/app/apikey";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open Link", `Please manually visit: ${url}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-slate-50 dark:bg-slate-800 rounded-t-3xl p-8 shadow-2xl">
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              API Key Settings
            </Text>
            <TouchableOpacity
              className="p-3 rounded-full active:bg-slate-200 dark:active:bg-slate-700"
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={28}
                className="text-slate-600 dark:text-slate-300"
              />
            </TouchableOpacity>
          </View>

          <Text className="text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Your Google Gemini API Key for receipt processing.
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-center p-4 mb-8 bg-green-500 active:bg-green-600 rounded-xl shadow-md"
            onPress={handleOpenApiStudio}
          >
            <Ionicons
              name="open-outline"
              size={22}
              className="text-white mr-3"
            />
            <Text className="text-white font-semibold text-base">
              Get/Manage API Key at AI Studio
            </Text>
          </TouchableOpacity>

          <TextInput
            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl p-5 mb-8 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
            placeholder="Enter or update your API Key"
            value={tempApiKey}
            onChangeText={onTempApiKeyChange}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <View className="flex-row space-x-4 mb-8">
            <TouchableOpacity
              className={`flex-1 py-4 px-6 rounded-xl items-center justify-center shadow-md ${
                isSavingKey
                  ? "bg-sky-300 dark:bg-sky-700"
                  : "bg-sky-500 dark:bg-sky-600 active:bg-sky-600 dark:active:bg-sky-500"
              }`}
              onPress={onUpdateKey}
              disabled={isSavingKey || tempApiKey === storedApiKey}
            >
              {isSavingKey ? (
                <ActivityIndicator
                  color={colorScheme === "dark" ? "#e2e8f0" : "#ffffff"}
                  size="small"
                />
              ) : (
                <Text className="text-white font-bold text-base">
                  Update Key
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 px-6 rounded-xl items-center justify-center shadow-md ${
                isSavingKey
                  ? "bg-red-300 dark:bg-red-800"
                  : "bg-red-600 dark:bg-red-700 active:bg-red-700 dark:active:bg-red-600"
              }`}
              onPress={onDeleteKey}
              disabled={isSavingKey || !storedApiKey}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="trash-outline"
                  size={18}
                  className="text-white mr-2"
                />
                <Text className="text-white font-bold text-base">
                  Delete Key
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center p-4 bg-amber-100 dark:bg-amber-800/50 border border-amber-300 dark:border-amber-700 rounded-xl">
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              className="text-amber-600 dark:text-amber-400"
            />
            <Text className="text-sm text-amber-700 dark:text-amber-300 ml-3 flex-1 leading-relaxed">
              Your API key is stored securely on this device and never shared.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
