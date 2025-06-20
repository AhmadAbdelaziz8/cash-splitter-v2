import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ServiceEditModalProps {
  isVisible: boolean;
  currentService: number | null;
  onClose: () => void;
  onSave: (service: number | null) => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  isVisible,
  currentService,
  onClose,
  onSave,
}) => {
  const [serviceValueInput, setServiceValueInput] = useState("");

  useEffect(() => {
    if (isVisible) {
      if (typeof currentService === "number") {
        setServiceValueInput(currentService.toString());
      } else {
        setServiceValueInput("");
      }
    }
  }, [currentService, isVisible]);

  const handleSave = () => {
    const trimmedValue = serviceValueInput.trim().replace(",", ".");

    if (trimmedValue === "") {
      onSave(null);
      onClose();
      return;
    }

    const numericValue = parseFloat(trimmedValue);
    if (isNaN(numericValue) || numericValue < 0) {
      Alert.alert(
        "Invalid Service Amount",
        "Please enter a valid non-negative amount for the service charge, or leave it empty to remove."
      );
      return;
    }

    onSave(numericValue);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-slate-200/70"
      >
        <View className="w-[90%] max-w-[400px] bg-white rounded-xl p-5 shadow-lg">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-slate-900">
              Edit Service Charge
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close-circle-outline" size={30} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <Text className="text-sm text-slate-600 mb-2 font-medium">
              Service Amount ($)
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-lg border border-slate-300">
              <TextInput
                className="flex-1 text-slate-900 px-4 py-3 text-base text-right"
                placeholder="e.g., 10.00"
                placeholderTextColor="#64748b"
                value={serviceValueInput}
                onChangeText={setServiceValueInput}
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>
            <Text className="text-xs text-slate-500 mt-2 text-center">
              Enter the service charge. Leave empty or enter 0 to remove.
            </Text>
          </View>

          <View className="flex-row justify-between mt-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 rounded-lg mx-1 bg-slate-200"
              onPress={onClose}
            >
              <Ionicons
                name="close-outline"
                size={20}
                color="#475569"
                className="mr-2"
              />
              <Text className="text-slate-700 text-base font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 rounded-lg mx-1 bg-blue-600"
              onPress={handleSave}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white text-base font-semibold">
                Save Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ServiceEditModal;
