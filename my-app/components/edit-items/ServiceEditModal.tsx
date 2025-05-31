import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";

export type ServiceType = "fixed" | "percentage";

export interface ServiceEditModalProps {
  visible: boolean;
  initialServiceValue: number | string | null;
  onClose: () => void;
  onSave: (service: number | string | null) => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  visible,
  initialServiceValue,
  onClose,
  onSave,
}) => {
  const [serviceValue, setServiceValue] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("fixed");

  useEffect(() => {
    if (visible) {
      // Only update state if modal becomes visible
      if (
        typeof initialServiceValue === "string" &&
        initialServiceValue.includes("%")
      ) {
        setServiceType("percentage");
        setServiceValue(parseFloat(initialServiceValue).toString() || "0");
      } else {
        setServiceType("fixed");
        setServiceValue((initialServiceValue as number)?.toString() ?? "0");
      }
    }
  }, [initialServiceValue, visible]);

  const handleSave = () => {
    const numericValue = parseFloat(serviceValue);
    if (isNaN(numericValue) || numericValue < 0) {
      Alert.alert(
        "Invalid Service Value",
        "Please enter a valid non-negative number."
      );
      return;
    }

    if (serviceType === "percentage") {
      onSave(numericValue > 0 ? `${numericValue}%` : null);
    } else {
      onSave(numericValue > 0 ? numericValue : null);
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-5 rounded-xl w-4/5 items-center">
          <Text className="text-xl font-bold mb-4">Edit Service Charge</Text>

          <View className="flex-row justify-around w-full mb-4">
            <TouchableOpacity
              className={`p-2 border-b-2 ${
                serviceType === "fixed"
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              onPress={() => setServiceType("fixed")}
            >
              <Text
                className={`${
                  serviceType === "fixed" ? "text-blue-500" : "text-slate-600"
                }`}
              >
                Fixed Amount
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 border-b-2 ${
                serviceType === "percentage"
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              onPress={() => setServiceType("percentage")}
            >
              <Text
                className={`${
                  serviceType === "percentage"
                    ? "text-blue-500"
                    : "text-slate-600"
                }`}
              >
                Percentage
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center w-full mb-4">
            <TextInput
              className="border border-slate-300 rounded-md p-[10px] flex-1 text-base"
              placeholder={
                serviceType === "fixed"
                  ? "Service Amount"
                  : "Service Percentage"
              }
              value={serviceValue}
              onChangeText={setServiceValue}
              keyboardType="numeric"
            />
            {serviceType === "percentage" && (
              <Text className="text-xl ml-2">%</Text>
            )}
          </View>

          <View className="flex-row w-full">
            <TouchableOpacity
              className="bg-slate-500 p-3 rounded-lg items-center flex-1 mr-1"
              onPress={onClose}
            >
              <Text className="text-white text-base font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg items-center flex-1 ml-1"
              onPress={handleSave}
            >
              <Text className="text-white text-base font-bold">
                Save Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ServiceEditModal;
