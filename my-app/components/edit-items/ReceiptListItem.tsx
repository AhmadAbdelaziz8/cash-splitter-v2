import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReceiptItem } from "@/types";

interface ReceiptListItemProps {
  item: ReceiptItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (item: ReceiptItem) => void;
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
    <View className="flex-row justify-between items-center py-3 px-2 border-b border-slate-200 bg-white rounded-lg mb-2 shadow-sm">
      <View className="flex-row items-center flex-1 mr-2">
        <TouchableOpacity
          onPress={() => onToggleSelection(item.id)}
          className="p-2 mr-2"
        >
          <Ionicons
            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
            size={26}
            color={isSelected ? "#3b82f6" : "#64748b"}
          />
        </TouchableOpacity>
        <View className="flex min-w-0">
          <View className="bg-green-100 px-3 py-2 rounded-lg mb-2">
            <Text
              className="text-lg font-semibold text-green-800"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </View>
          <Text className="text-sm text-slate-600">Qty: {item.quantity}</Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <Text className="text-base font-bold text-slate-900 mr-3">
          ${item.price.toFixed(2)}
        </Text>
        {/* edit */}
        <TouchableOpacity
          onPress={() => onEdit(item)}
          className="p-2 ml-1 bg-yellow-100  rounded-full"
        >
          <Ionicons name="pencil-outline" size={22} color="#facc15" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          className="p-2 ml-1 bg-red-100 rounded-full"
        >
          <Ionicons name="trash-outline" size={22} color="#f87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReceiptListItem;
