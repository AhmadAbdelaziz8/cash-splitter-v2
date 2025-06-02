import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Assuming Ionicons are used for any icons if needed
import { ReceiptItem } from "@/contexts/ReceiptContext"; // Import base ReceiptItem type

export interface ItemEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (
    itemData: { name: string; price: number; quantity: number },
    id?: string
  ) => void;
  item: ReceiptItem | null; // Pass the whole item or null for adding
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
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>
              {item ? "Edit Item Details" : "Add New Item"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close-circle-outline"
                size={30}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Coffee, Sandwich"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
          </View>

          <View style={styles.rowInputContainer}>
            <View style={styles.inputColumnLeft}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#64748b"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputColumnRight}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#64748b"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.buttonBase, styles.secondaryButton]}
              onPress={onClose}
            >
              <Ionicons
                name="close-outline"
                size={20}
                style={styles.buttonIconSecondary}
              />
              <Text style={styles.buttonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonBase, styles.primaryButton]}
              onPress={handleSave}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                style={styles.buttonIconPrimary}
              />
              <Text style={styles.buttonTextPrimary}>Save Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    color: "#94a3b8",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#334155",
    color: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#475569",
  },
  rowInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputColumnLeft: {
    flex: 1,
    marginRight: 8,
  },
  inputColumnRight: {
    flex: 1,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#475569",
  },
  buttonTextPrimary: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIconPrimary: {
    color: "#ffffff",
    marginRight: 8,
  },
  buttonIconSecondary: {
    color: "#e2e8f0",
    marginRight: 8,
  },
});

export default ItemEditModal;
