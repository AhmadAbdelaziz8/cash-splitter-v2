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
import { ReceiptItem } from "@/contexts/ReceiptContext";

export interface ItemEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (
    itemData: { name: string; price: number; quantity: number },
    id?: string
  ) => void;
  item: ReceiptItem | null;
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isVisible,
  onClose,
  onSave,
  item,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (isVisible && item) {
      setName(item.name);
      setPrice(item.price.toString());
      setQuantity(item.quantity.toString());
    } else if (isVisible && !item) {
      // Reset for new item when modal becomes visible
      setName("");
      setPrice("");
      setQuantity("1");
    }
  }, [item, isVisible]);

  const handleSave = () => {
    const numericPrice = parseFloat(price.replace(",", "."));
    const numericQuantity = parseInt(quantity, 10);

    if (
      !name.trim() ||
      isNaN(numericPrice) ||
      numericPrice < 0 ||
      isNaN(numericQuantity) ||
      numericQuantity <= 0
    ) {
      Alert.alert(
        "Invalid Input",
        "Please provide a valid name, a positive price, and a quantity greater than zero."
      );
      return;
    }
    onSave(
      { name: name.trim(), price: numericPrice, quantity: numericQuantity },
      item?.id
    );
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
              {item ? "Edit Item Details" : "Add New Item"}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close-circle-outline" size={30} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-slate-600 mb-2 font-medium">
              Item Name
            </Text>
            <TextInput
              className="bg-slate-100 text-slate-900 rounded-lg px-4 py-3 text-base border border-slate-300"
              placeholder="e.g., Coffee, Sandwich"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
          </View>

          <View className="flex-row justify-between mb-5">
            <View className="flex-1 mr-2">
              <Text className="text-sm text-slate-600 mb-2 font-medium">
                Price ($)
              </Text>
              <TextInput
                className="bg-slate-100 text-slate-900 rounded-lg px-4 py-3 text-base border border-slate-300"
                placeholder="0.00"
                placeholderTextColor="#64748b"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm text-slate-600 mb-2 font-medium">
                Quantity
              </Text>
              <TextInput
                className="bg-slate-100 text-slate-900 rounded-lg px-4 py-3 text-base border border-slate-300"
                placeholder="1"
                placeholderTextColor="#64748b"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-4">
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
                Save Item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ItemEditModal;
