import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
    <View className="flex-row justify-between items-center py-3 border-b border-slate-200">
      <View className="flex-row items-center flex-1 min-w-0 mr-2">
        <TouchableOpacity
          onPress={() => onToggleSelection(item.id)}
          className="mr-2 p-1" // Added small padding for easier touch
        >
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? "#007bff" : "#6c757d"}
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
        <TouchableOpacity onPress={() => onEdit(item)} className="p-2">
          <Ionicons name="pencil" size={20} color="#ffc107" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          className="p-2 ml-1"
        >
          <Ionicons name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReceiptListItem;
