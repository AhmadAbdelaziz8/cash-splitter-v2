import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const EditItemsScreen: React.FC = () => {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleUserItemSelection,
    userSelectedItemIds,
    userSubtotal,
    generateShareableLink,
  } = useReceipt();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReceiptItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const openModalToAdd = () => {
    setCurrentItem(null);
    setItemName("");
    setItemPrice("");
    setModalVisible(true);
  };

  const openModalToEdit = (item: ReceiptItem) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setModalVisible(true);
  };

  const handleSaveItem = () => {
    const price = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(price) || price < 0) {
      Alert.alert("Invalid Input", "Please enter a valid name and price.");
      return;
    }

    if (currentItem) {
      updateItem(currentItem.id, { name: itemName, price });
    } else {
      addItem({ name: itemName, price });
    }
    setModalVisible(false);
    setItemName("");
    setItemPrice("");
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteItem(id), style: "destructive" },
    ]);
  };

  const handleFinalize = () => {
    generateShareableLink();
    router.push("/ShareLinkScreen"); // Navigate to the new share screen
  };

  const renderItemRow = ({ item }: { item: ReceiptItem }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-200">
      <View className="flex-row items-center flex-1 min-w-0 mr-2">
        <TouchableOpacity
          onPress={() => toggleUserItemSelection(item.id)}
          className="mr-2"
        >
          <Ionicons
            name={
              userSelectedItemIds.includes(item.id)
                ? "checkbox"
                : "square-outline"
            }
            size={24}
            color={
              userSelectedItemIds.includes(item.id) ? "#007bff" : "#6c757d"
            }
          />
        </TouchableOpacity>
        <View className="bg-sky-100 px-3 py-1.5 rounded-xl flex-shrink min-w-0">
          <Text
            className="text-base text-slate-600"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Text className="text-base font-bold text-slate-600 mr-2">
          ${item.price.toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => openModalToEdit(item)} className="p-2">
          <Ionicons name="pencil" size={20} color="#ffc107" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item.id)}
          className="p-2 ml-1"
        >
          <Ionicons name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-slate-50">
      <Text className="text-2xl font-bold mb-4 text-slate-700">
        Edit Receipt Items
      </Text>

      <FlatList
        data={items}
        renderItem={renderItemRow}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center my-5 text-base text-slate-500">
            No items yet. Add some!
          </Text>
        }
      />

      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-lg items-center mt-4"
        onPress={openModalToAdd}
      >
        <Text className="text-white text-base font-bold">Add New Item</Text>
      </TouchableOpacity>

      <View className="mt-4 py-2 border-t border-slate-300">
        <Text className="text-lg font-bold text-right text-green-600">
          Your Subtotal: ${userSubtotal.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-lg items-center mt-4 disabled:opacity-50"
        onPress={handleFinalize}
        disabled={items.length === 0}
      >
        <Text className="text-white text-base font-bold">
          Finalize & Get Link
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-4/5 items-center">
            <Text className="text-xl font-bold mb-4">
              {currentItem ? "Edit Item" : "Add New Item"}
            </Text>
            <TextInput
              className="border border-slate-300 rounded-md p-[10px] w-full mb-[10px] text-base"
              placeholder="Item Name"
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              className="border border-slate-300 rounded-md p-[10px] w-full mb-[10px] text-base"
              placeholder="Price"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg items-center mt-4 w-full"
              onPress={handleSaveItem}
            >
              <Text className="text-white text-base font-bold">Save Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-slate-500 p-3 rounded-lg items-center w-full mt-[10px]"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-base font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditItemsScreen;
