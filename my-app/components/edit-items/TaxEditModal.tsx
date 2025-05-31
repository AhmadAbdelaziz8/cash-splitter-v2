import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";

export interface TaxEditModalProps {
  visible: boolean;
  initialTaxValue: number | null;
  onClose: () => void;
  onSave: (tax: number | null) => void;
}

const TaxEditModal: React.FC<TaxEditModalProps> = ({
  visible,
  initialTaxValue,
  onClose,
  onSave,
}) => {
  const [tax, setTax] = useState("");

  useEffect(() => {
    setTax(initialTaxValue?.toString() ?? "0");
  }, [initialTaxValue, visible]);

  const handleSave = () => {
    const numericTax = parseFloat(tax);
    if (isNaN(numericTax) || numericTax < 0) {
      Alert.alert(
        "Invalid Tax",
        "Please enter a valid non-negative number for tax."
      );
      return;
    }
    onSave(numericTax > 0 ? numericTax : null);
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
          <Text className="text-xl font-bold mb-4">Edit Tax</Text>
          <TextInput
            className="border border-slate-300 rounded-md p-[10px] w-full mb-4 text-base"
            placeholder="Tax Amount"
            value={tax}
            onChangeText={setTax}
            keyboardType="numeric"
          />
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
              <Text className="text-white text-base font-bold">Save Tax</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TaxEditModal;
