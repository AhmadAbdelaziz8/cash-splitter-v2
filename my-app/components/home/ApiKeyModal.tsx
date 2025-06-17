import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme, ModalProps } from "@/types";

interface ApiKeyModalProps extends ModalProps {
  tempApiKey: string;
  isSavingKey: boolean;
  colorScheme: ColorScheme;
  storedApiKey: string | null;
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
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open Google AI Studio");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open Google AI Studio");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white ">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-slate-200 ">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            API Key Settings
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-lg bg-slate-100 "
          >
            <Ionicons name="close" size={24} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 p-6">
          <View className="mb-8">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Google Gemini API Key
            </Text>
            <Text className="text-slate-600  mb-6 leading-6">
              Enter your Google Gemini API key to enable receipt processing.
              Your key is stored securely on your device.
            </Text>

            <TextInput
              value={tempApiKey}
              onChangeText={onTempApiKeyChange}
              placeholder="Enter your API key..."
              placeholderTextColor={
                colorScheme === "dark" ? "#64748b" : "#94a3b8"
              }
              className="bg-slate-50  border border-slate-300  rounded-xl px-4 py-4 text-slate-900  text-base mb-4"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleOpenApiStudio}
              className="flex-row items-center justify-center bg-blue-50  border border-blue-200  rounded-xl p-4 mb-6"
            >
              <Ionicons
                name="open-outline"
                size={20}
                color="#3b82f6"
                className="mr-2"
              />
              <Text className="text-blue-600  font-medium">
                Get API Key from Google AI Studio
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="gap-4">
            <TouchableOpacity
              onPress={onUpdateKey}
              disabled={isSavingKey || !tempApiKey.trim()}
              className={`py-4 rounded-xl items-center ${
                isSavingKey || !tempApiKey.trim()
                  ? "bg-slate-300 "
                  : "bg-blue-600 "
              }`}
            >
              <Text
                className={`font-semibold text-lg ${
                  isSavingKey || !tempApiKey.trim()
                    ? "text-slate-500 "
                    : "text-white"
                }`}
              >
                {isSavingKey
                  ? "Saving..."
                  : storedApiKey
                  ? "Update API Key"
                  : "Save API Key"}
              </Text>
            </TouchableOpacity>

            {storedApiKey && (
              <TouchableOpacity
                onPress={onDeleteKey}
                disabled={isSavingKey}
                className="py-4 rounded-xl items-center bg-red-50  border border-red-200 "
              >
                <Text className="text-red-600  font-semibold text-lg">
                  Delete API Key
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
