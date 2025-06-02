import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
    clearError,
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
    clearError();
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
    clearError();
    router.replace("/(tabs)/");
  };

  const currentItemsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const isLoading = contextIsProcessing || isProcessingLocally;

  if (isLoading && !processingError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={styles.spacingBottom}
        />
        <Text style={styles.loadingTitle}>Processing Your Receipt...</Text>
        <Text style={styles.loadingText}>Extracting items, just a moment!</Text>
      </View>
    );
  }

  if (processingError) {
    const isApiKeyError = processingError.includes("API Key not found");
    return (
      <View style={[styles.container, styles.centered, styles.padding]}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>
            {isApiKeyError ? "API Key Required" : "Processing Error"}
          </Text>
          <Text style={styles.errorText}>
            {isApiKeyError
              ? "A valid Google Gemini API Key is needed to process receipts. Please set it up in the app settings."
              : processingError}
          </Text>
          {isApiKeyError ? (
            <TouchableOpacity
              style={[
                styles.buttonBase,
                styles.primaryButton,
                styles.spacingTop,
              ]}
              onPress={handleGoBackToHome}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Go to Settings</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.buttonBase,
                styles.primaryButton,
                styles.spacingTop,
              ]}
              onPress={handleRetryProcess}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.buttonBase,
              styles.secondaryButton,
              styles.spacingTopSmall,
            ]}
            onPress={() => router.replace("/camera")}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              style={styles.secondaryButtonIcon}
            />
            <Text style={styles.secondaryButtonText}>Capture New Image</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isLoading && items.length === 0 && !processingError && imageBase64) {
    return (
      <View style={[styles.container, styles.centered, styles.padding]}>
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={48} style={styles.emptyIcon} />
          <Text style={styles.errorTitle}>No Items Found</Text>
          <Text style={styles.errorText}>
            We couldn't find any items on the receipt, or there was an issue
            during processing. You can try capturing the image again or add
            items manually.
          </Text>
          <TouchableOpacity
            style={[styles.buttonBase, styles.primaryButton, styles.spacingTop]}
            onPress={() => router.replace("/camera")}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Recapture Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonBase,
              styles.secondaryButton,
              styles.spacingTopSmall,
            ]}
            onPress={openItemModalToAdd}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              style={styles.secondaryButtonIcon}
            />
            <Text style={styles.secondaryButtonText}>Add Item Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={[
          styles.floatingBackButton,
          { top: bottom > 0 ? bottom + 0 : 15 },
        ]} // Adjusted top positioning slightly differently from preview for potentially different safe area inset
        onPress={() => router.replace("/camera")}
        disabled={isLoading}
      >
        <Ionicons name="arrow-back-outline" size={28} color="#e2e8f0" />
      </TouchableOpacity>

      <FlatList
        style={styles.list}
        data={items}
        renderItem={({ item }) => (
          <ReceiptListItem
            item={item}
            isSelected={userSelectedItemIds.includes(item.id)}
            onToggleSelection={() => toggleUserItemSelection(item.id)}
            onEdit={() => openItemModalToEdit(item)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isLoading &&
          !processingError && (
            <View style={styles.centeredMessageContainer}>
              <Ionicons
                name="document-text-outline"
                size={40}
                style={styles.emptyListIcon}
              />
              <Text style={styles.emptyListText}>
                No items yet. Add manually or scan a new receipt.
              </Text>
            </View>
          )
        }
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>Detected Items</Text>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            <ReceiptTotalsFooter
              itemsSubtotal={currentItemsSubtotal}
              tax={receiptTax}
              serviceCharge={serviceChargeValue}
              originalReceiptTotal={originalReceiptTotal}
              grandTotal={receiptTotal}
              onEditTax={() => setTaxModalVisible(true)}
              onEditService={() => setServiceModalVisible(true)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContentContainer}
      />

      <View
        style={[
          styles.actionButtonsContainer,
          { paddingBottom: bottom > 0 ? bottom + 10 : 20, paddingTop: 10 },
        ]}
      >
        <TouchableOpacity
          style={[styles.buttonBase, styles.secondaryButton, styles.flexButton]}
          onPress={openItemModalToAdd}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            style={styles.secondaryButtonIcon}
          />
          <Text style={styles.secondaryButtonText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonBase,
            styles.primaryButton,
            styles.flexButton,
            items.length === 0 && styles.disabledButton,
          ]}
          onPress={handleFinalize}
          disabled={items.length === 0}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Finalize & Share</Text>
        </TouchableOpacity>
      </View>

      {itemModalVisible && (
        <ItemEditModal
          isVisible={itemModalVisible}
          onClose={() => setItemModalVisible(false)}
          onSave={handleSaveItem}
          item={currentItemForEdit}
        />
      )}
      {taxModalVisible && (
        <TaxEditModal
          isVisible={taxModalVisible}
          onClose={() => setTaxModalVisible(false)}
          onSave={updateReceiptTax}
          currentTax={receiptTax}
        />
      )}
      {serviceModalVisible && (
        <ServiceEditModal
          isVisible={serviceModalVisible}
          onClose={() => setServiceModalVisible(false)}
          onSave={updateServiceChargeValue}
          currentService={serviceChargeValue}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  floatingBackButton: {
    position: "absolute",
    left: 15,
    // top is set dynamically
    zIndex: 10,
    backgroundColor: "rgba(30, 41, 59, 0.7)", // slate-800 with opacity
    padding: 10,
    borderRadius: 25, // Makes it circular
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  padding: {
    padding: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    color: "#f87171",
    marginBottom: 15,
  },
  emptyIcon: {
    color: "#60a5fa",
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#cbd5e1",
    paddingVertical: 12,
    paddingHorizontal: 5,
    marginBottom: 8,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyListIcon: {
    color: "#64748b",
    marginBottom: 10,
  },
  emptyListText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  footerContainer: {
    marginTop: 10,
    paddingBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    backgroundColor: "#1e293b",
    paddingHorizontal: 15,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  flexButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButtonIcon: {
    color: "#e2e8f0",
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#4b5563",
  },
  spacingBottom: { marginBottom: 10 },
  spacingTop: { marginTop: 20 },
  spacingTopSmall: { marginTop: 12 },
});

export default EditItemsScreen;
