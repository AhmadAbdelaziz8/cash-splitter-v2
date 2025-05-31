import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Assuming Ionicons are used for any icons if needed
import { ReceiptItem } from "@/contexts/ReceiptContext"; // Import base ReceiptItem type

export interface ItemEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    itemData: { name: string; price: number; quantity: number },
    id?: string
  ) => void;
  currentItem: ReceiptItem | null; // Pass the whole item or null for adding
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({
  visible,
  onClose,
  onSave,
  currentItem,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name);
      setPrice(currentItem.price.toString());
      setQuantity(currentItem.quantity.toString());
    } else {
      // Reset for new item
      setName("");
      setPrice("");
      setQuantity("1");
    }
  }, [currentItem, visible]); //Rerender when currentItem or visibility changes

  const handleSave = () => {
    const numericPrice = parseFloat(price);
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
        "Please enter a valid name, price, and quantity (greater than 0)."
      );
      return;
    }
    onSave(
      { name: name.trim(), price: numericPrice, quantity: numericQuantity },
      currentItem?.id
    );
    onClose(); // Close modal after saving
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
          <Text className="text-xl font-bold mb-4">
            {currentItem ? "Edit Item" : "Add New Item"}
          </Text>
          <TextInput
            className="border border-slate-300 rounded-md p-[10px] w-full mb-[10px] text-base"
            placeholder="Item Name"
            value={name}
            onChangeText={setName}
          />
          <View className="flex-row justify-between w-full mb-[10px]">
            <View className="flex-1 mr-1">
              <Text className="text-sm text-slate-600 mb-1">Price:</Text>
              <TextInput
                className="border border-slate-300 rounded-md p-[10px] text-base w-full"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-1">
              <Text className="text-sm text-slate-600 mb-1">Quantity:</Text>
              <TextInput
                className="border border-slate-300 rounded-md p-[10px] text-base w-full"
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg items-center mt-4 w-full"
            onPress={handleSave}
          >
            <Text className="text-white text-base font-bold">Save Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-slate-500 p-3 rounded-lg items-center w-full mt-[10px]"
            onPress={onClose}
          >
            <Text className="text-white text-base font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ItemEditModal;
