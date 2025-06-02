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
import { Ionicons } from "@expo/vector-icons";

export interface TaxEditModalProps {
  isVisible: boolean;
  currentTax: number | null;
  onClose: () => void;
  onSave: (tax: number | null) => void;
}

const TaxEditModal: React.FC<TaxEditModalProps> = ({
  isVisible,
  currentTax,
  onClose,
  onSave,
}) => {
  const [taxInput, setTaxInput] = useState("");

  useEffect(() => {
    if (isVisible) {
      setTaxInput(currentTax?.toString() ?? "");
    }
  }, [currentTax, isVisible]);

  const handleSave = () => {
    const trimmedTax = taxInput.trim().replace(",", ".");
    if (trimmedTax === "") {
      onSave(null);
      onClose();
      return;
    }

    const numericTax = parseFloat(trimmedTax);
    if (isNaN(numericTax) || numericTax < 0) {
      Alert.alert(
        "Invalid Tax Amount",
        "Please enter a valid non-negative number for the tax, or leave it empty to remove tax."
      );
      return;
    }
    onSave(numericTax);
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
            <Text style={styles.modalTitle}>Edit Tax Amount</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close-circle-outline"
                size={30}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tax Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.75 or leave empty"
              placeholderTextColor="#64748b"
              value={taxInput}
              onChangeText={setTaxInput}
              keyboardType="numeric"
              autoFocus={true}
            />
            <Text style={styles.infoText}>
              Enter the total tax amount. Leave empty or enter 0 to remove tax.
            </Text>
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
              <Text style={styles.buttonTextPrimary}>Save Tax</Text>
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
    marginBottom: 20,
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
    textAlign: "right",
  },
  infoText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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

export default TaxEditModal;
