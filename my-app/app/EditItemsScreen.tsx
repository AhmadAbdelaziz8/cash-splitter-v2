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
    originalReceiptTotal,
    updateReceiptTax,
    updateReceiptService,
  } = useReceipt();

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReceiptItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");

  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [editableTax, setEditableTax] = useState("");

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editableService, setEditableService] = useState("");
  const [serviceType, setServiceType] = useState<"fixed" | "percentage">(
    "fixed"
  );

  const openItemModalToAdd = () => {
    setCurrentItem(null);
    setItemName("");
    setItemPrice("");
    setItemQuantity("1");
    setItemModalVisible(true);
  };

  const openItemModalToEdit = (item: ReceiptItem) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemQuantity(item.quantity.toString());
    setItemModalVisible(true);
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
    setItemModalVisible(false);
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

  const openTaxModal = () => {
    setEditableTax(receiptTax?.toString() ?? "0");
    setTaxModalVisible(true);
  };

  const handleSaveTax = () => {
    const newTax = parseFloat(editableTax);
    if (isNaN(newTax) || newTax < 0) {
      Alert.alert(
        "Invalid Tax",
        "Please enter a valid non-negative number for tax."
      );
      return;
    }
    updateReceiptTax(newTax > 0 ? newTax : null);
    setTaxModalVisible(false);
  };

  const openServiceModal = () => {
    if (typeof receiptService === "string" && receiptService.includes("%")) {
      setServiceType("percentage");
      setEditableService(parseFloat(receiptService).toString() || "0");
    } else {
      setServiceType("fixed");
      setEditableService((receiptService as number)?.toString() ?? "0");
    }
    setServiceModalVisible(true);
  };

  const handleSaveService = () => {
    const serviceValue = parseFloat(editableService);
    if (isNaN(serviceValue) || serviceValue < 0) {
      Alert.alert(
        "Invalid Service Value",
        "Please enter a valid non-negative number."
      );
      return;
    }

    if (serviceType === "percentage") {
      updateReceiptService(serviceValue > 0 ? `${serviceValue}%` : null);
    } else {
      updateReceiptService(serviceValue > 0 ? serviceValue : null);
    }
    setServiceModalVisible(false);
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
        <TouchableOpacity
          onPress={() => openItemModalToEdit(item)}
          className="p-2"
        >
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

  const renderListFooter = () => {
    let serviceDisplayAmount = 0;
    let serviceDisplayText = "Service:";

    if (typeof receiptService === "number") {
      serviceDisplayAmount = receiptService;
      serviceDisplayText = "Service (Fixed):";
    } else if (
      typeof receiptService === "string" &&
      receiptService.includes("%")
    ) {
      const percentage = parseFloat(receiptService);
      if (!isNaN(percentage)) {
        serviceDisplayAmount = (percentage / 100) * currentItemsSubtotal;
        serviceDisplayText = `Service (${receiptService}):`;
      }
    }

    return (
      <View className="mt-6 pt-4 border-t border-slate-300">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base text-slate-600">Items Subtotal:</Text>
          <Text className="text-base font-semibold text-slate-700">
            ${currentItemsSubtotal.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Text className="text-base text-slate-600 mr-2">Tax:</Text>
            <TouchableOpacity
              onPress={openTaxModal}
              className="p-1.5 bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <Ionicons name="pencil" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text className="text-base font-semibold text-slate-700">
            ${(receiptTax ?? 0).toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Text className="text-base text-slate-600 mr-2">
              {serviceDisplayText}
            </Text>
            <TouchableOpacity
              onPress={openServiceModal}
              className="p-1.5 bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <Ionicons name="pencil" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text className="text-base font-semibold text-slate-700">
            ${serviceDisplayAmount.toFixed(2)}
          </Text>
        </View>

        {originalReceiptTotal !== null && (
          <View className="flex-row justify-between items-center mb-1 mt-1 opacity-70">
            <Text className="text-sm text-slate-500">
              Original Receipt Total:
            </Text>
            <Text className="text-sm font-semibold text-slate-600">
              ${originalReceiptTotal.toFixed(2)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-200">
          <Text className="text-lg font-bold text-slate-800">
            Final Grand Total:
          </Text>
          <Text className="text-lg font-bold text-slate-800">
            ${receiptTotal.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

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
        ListFooterComponent={renderListFooter}
      />

      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg items-center flex-1 mr-2"
          onPress={openItemModalToAdd}
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
        visible={itemModalVisible}
        onRequestClose={() => setItemModalVisible(false)}
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
              onPress={() => setItemModalVisible(false)}
            >
              <Text className="text-white text-base font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={taxModalVisible}
        onRequestClose={() => setTaxModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-4/5 items-center">
            <Text className="text-xl font-bold mb-4">Edit Tax</Text>
            <TextInput
              className="border border-slate-300 rounded-md p-[10px] w-full mb-4 text-base"
              placeholder="Tax Amount"
              value={editableTax}
              onChangeText={setEditableTax}
              keyboardType="numeric"
            />
            <View className="flex-row w-full">
              <TouchableOpacity
                className="bg-slate-500 p-3 rounded-lg items-center flex-1 mr-1"
                onPress={() => setTaxModalVisible(false)}
              >
                <Text className="text-white text-base font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-3 rounded-lg items-center flex-1 ml-1"
                onPress={handleSaveTax}
              >
                <Text className="text-white text-base font-bold">Save Tax</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={serviceModalVisible}
        onRequestClose={() => setServiceModalVisible(false)}
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
                value={editableService}
                onChangeText={setEditableService}
                keyboardType="numeric"
              />
              {serviceType === "percentage" && (
                <Text className="text-xl ml-2">%</Text>
              )}
            </View>

            <View className="flex-row w-full">
              <TouchableOpacity
                className="bg-slate-500 p-3 rounded-lg items-center flex-1 mr-1"
                onPress={() => setServiceModalVisible(false)}
              >
                <Text className="text-white text-base font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-3 rounded-lg items-center flex-1 ml-1"
                onPress={handleSaveService}
              >
                <Text className="text-white text-base font-bold">
                  Save Service
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditItemsScreen;
