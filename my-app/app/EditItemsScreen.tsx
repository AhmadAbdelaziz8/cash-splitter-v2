import React, { useState, useMemo } from "react";
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
    generateShareableLink,
    receiptTotal,
    receiptTax,
    receiptService,
  } = useReceipt();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReceiptItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");

  const openModalToAdd = () => {
    setCurrentItem(null);
    setItemName("");
    setItemPrice("");
    setItemQuantity("1");
    setModalVisible(true);
  };

  const openModalToEdit = (item: ReceiptItem) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemQuantity(item.quantity.toString());
    setModalVisible(true);
  };

  const handleSaveItem = () => {
    const price = parseFloat(itemPrice);
    const quantity = parseInt(itemQuantity, 10);

    if (
      !itemName.trim() ||
      isNaN(price) ||
      price < 0 ||
      isNaN(quantity) ||
      quantity <= 0
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid name, price, and quantity (greater than 0)."
      );
      return;
    }

    if (currentItem) {
      updateItem(currentItem.id, { name: itemName, price, quantity });
    } else {
      addItem({ name: itemName, price, quantity });
    }
    setModalVisible(false);
    setItemName("");
    setItemPrice("");
    setItemQuantity("1");
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteItem(id), style: "destructive" },
    ]);
  };

  const handleFinalize = () => {
    generateShareableLink();
    router.push("/ShareLinkScreen");
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
            {item.name} (Qty: {item.quantity})
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

  const currentItemsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  return (
    <View className="flex-1 p-4 bg-slate-50">
      <Text className="text-2xl font-bold mb-4 text-slate-700">
        Edit Receipt Items
      </Text>

      <FlatList
        className="flex-1"
        data={items}
        renderItem={renderItemRow}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center my-5 text-base text-slate-500">
            No items yet. Add some!
          </Text>
        }
        ListFooterComponent={() => (
          <View className="mt-6 pt-4 border-t border-slate-300">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-base text-slate-600">Items Subtotal:</Text>
              <Text className="text-base font-semibold text-slate-700">
                ${currentItemsSubtotal.toFixed(2)}
              </Text>
            </View>
            {receiptTax !== null && receiptTax > 0 && (
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base text-slate-600">
                  Tax (from receipt):
                </Text>
                <Text className="text-base font-semibold text-slate-700">
                  ${receiptTax.toFixed(2)}
                </Text>
              </View>
            )}
            {receiptService !== null && receiptService > 0 && (
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base text-slate-600">
                  Service (from receipt):
                </Text>
                <Text className="text-base font-semibold text-slate-700">
                  ${receiptService.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-200">
              <Text className="text-lg font-bold text-slate-800">
                Receipt Grand Total:
              </Text>
              <Text className="text-lg font-bold text-slate-800">
                ${receiptTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Button Container */}
      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg items-center flex-1 mr-2"
          onPress={openModalToAdd}
        >
          <Text className="text-white text-base font-bold">Add New Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg items-center flex-1 ml-2 disabled:opacity-50"
          onPress={handleFinalize}
          disabled={items.length === 0 || userSelectedItemIds.length === 0}
        >
          <Text className="text-white text-base font-bold">
            Finalize & Get Link
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
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
            <View className="flex-row justify-between w-full mb-[10px]">
              <View className="flex-1 mr-1">
                <Text className="text-sm text-slate-600 mb-1">Price:</Text>
                <TextInput
                  className="border border-slate-300 rounded-md p-[10px] text-base w-full"
                  placeholder="0.00"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-1">
                <Text className="text-sm text-slate-600 mb-1">Quantity:</Text>
                <TextInput
                  className="border border-slate-300 rounded-md p-[10px] text-base w-full"
                  placeholder="1"
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>
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
