import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ItemEditModal from "@/components/edit-items/ItemEditModal";
import TaxEditModal from "@/components/edit-items/TaxEditModal";
import ServiceEditModal from "@/components/edit-items/ServiceEditModal";
import ReceiptListItem from "@/components/edit-items/ReceiptListItem";
import ReceiptTotalsFooter from "@/components/edit-items/ReceiptTotalsFooter";

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
    serviceChargeValue,
    originalReceiptTotal,
    updateReceiptTax,
    updateServiceChargeValue,
    imageBase64,
    isProcessing,
    processingError,
    processReceiptImage,
  } = useReceipt();

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  const [currentItemForEdit, setCurrentItemForEdit] =
    useState<ReceiptItem | null>(null);

  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    console.log(
      "[EditItemsScreen] Mount/update. imageBase64:",
      !!imageBase64,
      "isProcessing:",
      isProcessing,
      "items.length:",
      items.length,
      "initialLoadAttempted:",
      initialLoadAttempted
    );
    if (imageBase64 && !isProcessing && !initialLoadAttempted) {
      console.log(
        "[EditItemsScreen] Conditions met, calling processReceiptImage."
      );
      setInitialLoadAttempted(true);
      processReceiptImage(imageBase64).catch((error) => {
        console.error(
          "[EditItemsScreen] Error from processReceiptImage call:",
          error
        );
      });
    } else if (!imageBase64 && !isProcessing && !initialLoadAttempted) {
      console.log(
        "[EditItemsScreen] No imageBase64, not processing, and no initial load attempt. Navigating to camera."
      );
      Alert.alert(
        "No Receipt Image",
        "Please select or capture a receipt image first.",
        [{ text: "OK", onPress: () => router.replace("/camera") }]
      );
    }
  }, [
    imageBase64,
    isProcessing,
    items,
    processReceiptImage,
    initialLoadAttempted,
  ]);

  useEffect(() => {
    if (processingError) {
      console.error(
        "[EditItemsScreen] Processing error from context:",
        processingError
      );
      Alert.alert("Processing Failed", processingError, [
        {
          text: "Try Again",
          onPress: () => {
            setInitialLoadAttempted(false);
            router.replace("/camera");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => router.replace("/camera"),
        },
      ]);
    }
  }, [processingError, router]);

  const openItemModalToAdd = () => {
    setCurrentItemForEdit(null);
    setItemModalVisible(true);
  };

  const openItemModalToEdit = (item: ReceiptItem) => {
    setCurrentItemForEdit(item);
    setItemModalVisible(true);
  };

  const handleSaveItem = (
    itemData: { name: string; price: number; quantity: number },
    id?: string
  ) => {
    if (id) {
      // Existing item
      updateItem(id, itemData);
    } else {
      // New item
      addItem(itemData);
    }
    setItemModalVisible(false); // Close modal handled by modal itself, but good for clarity
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

  const handleSaveTax = (newTax: number | null) => {
    updateReceiptTax(newTax);
    setTaxModalVisible(false); // Modal closes itself, this is redundant but harmless
  };

  const handleSaveService = (newService: number | string | null) => {
    updateServiceChargeValue(newService);
    setServiceModalVisible(false); // Modal closes itself, this is redundant but harmless
  };

  const currentItemsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  if (isProcessing || (!initialLoadAttempted && imageBase64)) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-slate-50">
        <ActivityIndicator size="large" color="#38bdf8" className="mb-5" />
        <Text className="text-xl font-semibold text-slate-700">
          Processing Your Receipt...
        </Text>
        <Text className="text-base text-slate-500 mt-2">
          This will just take a moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: bottom }} className="flex-1 p-4 bg-slate-50">
      <Text className="text-2xl font-bold mb-4 text-slate-700">
        Edit Receipt Items
      </Text>

      <FlatList
        className="flex-1"
        data={items}
        renderItem={({ item }) => (
          <ReceiptListItem
            item={item}
            isSelected={userSelectedItemIds.includes(item.id)}
            onToggleSelection={toggleUserItemSelection}
            onEdit={openItemModalToEdit}
            onDelete={handleDeleteItem}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center my-5 text-base text-slate-500">
            No items yet. Add some!
          </Text>
        }
        ListFooterComponent={() => (
          <ReceiptTotalsFooter
            itemsSubtotal={currentItemsSubtotal}
            tax={receiptTax}
            serviceCharge={serviceChargeValue}
            originalReceiptTotal={originalReceiptTotal}
            grandTotal={receiptTotal}
            onEditTax={() => setTaxModalVisible(true)}
            onEditService={() => setServiceModalVisible(true)}
          />
        )}
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
          disabled={items.length === 0}
        >
          <Text className="text-white text-base font-bold">
            Finalize & Get Link
          </Text>
        </TouchableOpacity>
      </View>

      <ItemEditModal
        visible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        onSave={handleSaveItem}
        currentItem={currentItemForEdit}
      />

      <TaxEditModal
        visible={taxModalVisible}
        onClose={() => setTaxModalVisible(false)}
        onSave={handleSaveTax}
        initialTaxValue={receiptTax}
      />

      <ServiceEditModal
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        onSave={handleSaveService}
        initialServiceValue={serviceChargeValue}
      />
    </View>
  );
};

export default EditItemsScreen;
