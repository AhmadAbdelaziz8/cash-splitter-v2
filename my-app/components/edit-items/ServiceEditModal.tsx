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

export type ServiceType = "fixed" | "percentage";

export interface ServiceEditModalProps {
  isVisible: boolean;
  currentService: number | string | null;
  onClose: () => void;
  onSave: (service: number | string | null) => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  isVisible,
  currentService,
  onClose,
  onSave,
}) => {
  const [serviceValueInput, setServiceValueInput] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("fixed");

  useEffect(() => {
    if (isVisible) {
      if (typeof currentService === "string" && currentService.includes("%")) {
        setServiceType("percentage");
        setServiceValueInput(currentService.replace("%", "").trim());
      } else if (typeof currentService === "number") {
        setServiceType("fixed");
        setServiceValueInput(currentService.toString());
      } else {
        setServiceType("fixed");
        setServiceValueInput("");
      }
    }
  }, [currentService, isVisible]);

  const handleSave = () => {
    const trimmedValue = serviceValueInput.trim().replace(",", ".");

    if (trimmedValue === "") {
      onSave(null);
      onClose();
      return;
    }

    const numericValue = parseFloat(trimmedValue);
    if (isNaN(numericValue) || numericValue < 0) {
      Alert.alert(
        "Invalid Service Value",
        "Please enter a valid non-negative number for the service charge, or leave it empty to remove."
      );
      return;
    }

    if (serviceType === "percentage") {
      onSave(`${numericValue}%`);
    } else {
      onSave(numericValue);
    }
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
            <Text style={styles.modalTitle}>Edit Service Charge</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close-circle-outline"
                size={30}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.typeSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                serviceType === "fixed" && styles.typeButtonActive,
              ]}
              onPress={() => setServiceType("fixed")}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                style={[
                  styles.typeIcon,
                  serviceType === "fixed" && styles.typeIconActive,
                ]}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  serviceType === "fixed" && styles.typeButtonTextActive,
                ]}
              >
                Fixed Amount
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                serviceType === "percentage" && styles.typeButtonActive,
              ]}
              onPress={() => setServiceType("percentage")}
            >
              <Ionicons
                name="trending-up-outline"
                size={20}
                style={[
                  styles.typeIcon,
                  serviceType === "percentage" && styles.typeIconActive,
                ]}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  serviceType === "percentage" && styles.typeButtonTextActive,
                ]}
              >
                Percentage (%)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {serviceType === "fixed"
                ? "Service Amount ($)"
                : "Service Percentage (%)"}
            </Text>
            <View style={styles.inputWithSymbolContainer}>
              <TextInput
                style={styles.input}
                placeholder={
                  serviceType === "fixed" ? "e.g., 10.00" : "e.g., 15"
                }
                placeholderTextColor="#64748b"
                value={serviceValueInput}
                onChangeText={setServiceValueInput}
                keyboardType="numeric"
                autoFocus={true}
              />
              {serviceType === "percentage" && (
                <Text style={styles.percentageSymbol}>%</Text>
              )}
            </View>
            <Text style={styles.infoText}>
              Enter the service charge. Leave empty or enter 0 to remove.
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
              <Text style={styles.buttonTextPrimary}>Save Service</Text>
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
  typeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#334155",
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: "#4f46e5",
  },
  typeIcon: {
    color: "#cbd5e1",
    marginRight: 6,
  },
  typeIconActive: {
    color: "#ffffff",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
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
  inputWithSymbolContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  input: {
    flex: 1,
    color: "#f1f5f9",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "right",
  },
  percentageSymbol: {
    fontSize: 18,
    color: "#94a3b8",
    fontWeight: "bold",
    paddingHorizontal: 15,
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

export default ServiceEditModal;
