import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ReceiptItem } from "@/types";

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
    isProcessing: contextIsProcessing,
    processingError,
    processReceiptImage,
    setProcessingError,
  } = useReceipt();

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [currentItemForEdit, setCurrentItemForEdit] =
    useState<ReceiptItem | null>(null);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [isProcessingLocally, setIsProcessingLocally] = useState(true);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const processImageOnMount = async () => {
      if (imageBase64 && !initialLoadAttempted) {
        setIsProcessingLocally(true);
        setInitialLoadAttempted(true);
        try {
          await processReceiptImage(imageBase64);
        } catch (error) {
          // Error is handled by processingError state from context
        } finally {
          setIsProcessingLocally(false);
        }
      } else if (!imageBase64) {
        setIsProcessingLocally(false);
      }
    };
    processImageOnMount();
  }, [imageBase64, initialLoadAttempted, processReceiptImage]);

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
      updateItem(id, itemData);
    } else {
      addItem(itemData);
    }
    setItemModalVisible(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteItem(id), style: "destructive" },
    ]);
  };

  const handleFinalize = () => {
    if (items.length === 0) {
      Alert.alert("No Items", "Please add or scan items before finalizing.");
      return;
    }
    generateShareableLink();
    router.push("/ShareLinkScreen");
  };

  const handleRetryProcess = () => {
    setProcessingError(null);
    if (imageBase64) {
      setInitialLoadAttempted(false);
      setIsProcessingLocally(true);
      processReceiptImage(imageBase64)
        .catch(() => {
          /* error handled by context */
        })
        .finally(() => setIsProcessingLocally(false));
    } else {
      Alert.alert(
        "Missing Image",
        "No image data to process. Please go back and capture an image."
      );
      router.replace("/camera");
    }
  };

  const handleGoBackToHome = () => {
    setProcessingError(null);
    router.replace("/(tabs)");
  };

  const currentItemsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const isLoading = contextIsProcessing || isProcessingLocally;

  if (isLoading && !processingError) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" className="mb-4" />
        <Text className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Processing Your Receipt...
        </Text>
        <Text className="text-base text-slate-600 dark:text-slate-400 text-center px-6">
          Extracting items, just a moment!
        </Text>
      </View>
    );
  }

  if (processingError) {
    const isApiKeyError = processingError.includes("API Key not found");
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 items-center justify-center p-6">
        <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 items-center max-w-sm w-full">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={isApiKeyError ? "#dc2626" : "#ef4444"}
            className="mb-4"
          />
          <Text className="text-xl font-bold text-red-800 dark:text-red-200 mb-2 text-center">
            {isApiKeyError ? "API Key Required" : "Processing Error"}
          </Text>
          <Text className="text-red-700 dark:text-red-300 text-center mb-6 leading-6">
            {isApiKeyError
              ? "A valid Google Gemini API Key is needed to process receipts. Please set it up in the app settings."
              : processingError}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 dark:bg-blue-700 px-6 py-3 rounded-xl flex-row items-center"
            onPress={isApiKeyError ? handleGoBackToHome : handleRetryProcess}
          >
            <Ionicons
              name={isApiKeyError ? "settings-outline" : "refresh-outline"}
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-semibold">
              {isApiKeyError ? "Go to Settings" : "Retry Processing"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <View className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">
            Edit Receipt Items
          </Text>
          <TouchableOpacity
            onPress={openItemModalToAdd}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900"
          >
            <Ionicons name="add" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      <View className="flex-1 px-4 py-2">
        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="receipt-outline"
              size={64}
              color="#94a3b8"
              className="mb-4"
            />
            <Text className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No Items Found
            </Text>
            <Text className="text-slate-500 dark:text-slate-500 text-center mb-6">
              Add items manually or retry processing your receipt.
            </Text>
            <TouchableOpacity
              onPress={openItemModalToAdd}
              className="bg-blue-600 dark:bg-blue-700 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Add First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReceiptListItem
                item={item}
                isSelected={userSelectedItemIds.includes(item.id)}
                onToggleSelection={toggleUserItemSelection}
                onEdit={openItemModalToEdit}
                onDelete={handleDeleteItem}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      {/* Footer */}
      <View style={{ paddingBottom: bottom }}>
        <ReceiptTotalsFooter
          itemsSubtotal={currentItemsSubtotal}
          tax={receiptTax}
          serviceCharge={serviceChargeValue}
          originalReceiptTotal={originalReceiptTotal}
          grandTotal={receiptTotal}
          onEditTax={() => setTaxModalVisible(true)}
          onEditService={() => setServiceModalVisible(true)}
        />
        <View className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <TouchableOpacity
            onPress={handleFinalize}
            className="bg-green-600 dark:bg-green-700 py-4 rounded-xl items-center"
            disabled={items.length === 0}
          >
            <Text className="text-white font-bold text-lg">
              Create Shareable Link
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <ItemEditModal
        isVisible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        onSave={handleSaveItem}
        item={currentItemForEdit}
      />

      <TaxEditModal
        isVisible={taxModalVisible}
        currentTax={receiptTax}
        onClose={() => setTaxModalVisible(false)}
        onSave={updateReceiptTax}
      />

      <ServiceEditModal
        isVisible={serviceModalVisible}
        currentService={serviceChargeValue}
        onClose={() => setServiceModalVisible(false)}
        onSave={updateServiceChargeValue}
      />
    </View>
  );
};

export default EditItemsScreen;
