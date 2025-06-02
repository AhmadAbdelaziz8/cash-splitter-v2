import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReceiptItem as ReceiptItemType } from "@/contexts/ReceiptContext"; // Renamed to avoid conflict with component name

export interface ReceiptListItemProps {
  item: ReceiptItemType;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (item: ReceiptItemType) => void;
  onDelete: (id: string) => void;
}

const ReceiptListItem: React.FC<ReceiptListItemProps> = ({
  item,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.itemDetailsContainer}>
        <TouchableOpacity
          onPress={() => onToggleSelection(item.id)}
          style={styles.checkboxContainer}
        >
          <Ionicons
            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
            size={26}
            style={isSelected ? styles.checkboxSelected : styles.checkboxDefault}
          />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={22} style={styles.editIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.iconButton}
        >
          <Ionicons name="trash-outline" size={22} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8, // Reduced horizontal padding to fit more content
    borderBottomWidth: 1,
    borderBottomColor: "#334155", // slate-700 (darker border for dark mode)
    backgroundColor: "#1e293b", // slate-800 (item background)
    borderRadius: 8,
    marginBottom: 8, // Space between items
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Allow this to take up available space
    marginRight: 8, // Space before price/actions
  },
  checkboxContainer: {
    padding: 6, // Slightly larger touch area
    marginRight: 8,
  },
  checkboxSelected: {
    color: "#3b82f6", // blue-500
  },
  checkboxDefault: {
    color: "#64748b", // slate-500
  },
  nameContainer: {
    flex: 1, // Allow text to take available space and ellipsize
    minWidth: 0, // Important for flexShrink and ellipsizeMode to work
  },
  itemName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#e2e8f0", // slate-200
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: "#94a3b8", // slate-400
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f1f5f9", // slate-100
    marginRight: 12,
  },
  iconButton: {
    padding: 8, // Standardized padding for icon buttons
    marginLeft: 4, // Reduced margin for more compact layout
  },
  editIcon: {
    color: "#facc15", // yellow-400
  },
  deleteIcon: {
    color: "#f87171", // red-400
  },
});

export default ReceiptListItem;
