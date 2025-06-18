import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReceiptItem } from "@/types";

interface ReceiptListItemProps {
  item: ReceiptItem;
  onEdit: (item: ReceiptItem) => void;
  onDelete: (id: string) => void;
}

const ReceiptListItem: React.FC<ReceiptListItemProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  return (
    <View className="bg-white rounded-2xl mb-4 shadow-lg border border-slate-100 overflow-hidden">
      {/* Main Content */}
      <View className="p-5">
        {/* Top Row: Item Name */}
        <View className="flex-row items-center mb-4">
          {/* Item Name - Takes full horizontal space */}
          <View className="flex-1 bg-green-100 px-4 py-3 rounded-xl">
            <Text
              className="text-lg font-bold text-green-800"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </View>
        </View>

        {/* Bottom Row: Quantity + Price & Actions */}
        <View className="flex-row items-end justify-between">
          {/* Quantity */}
          <View className="flex-1">
            <Text className="text-sm text-slate-500 mb-1">Quantity</Text>
            <Text className="text-base font-semibold text-slate-900">
              {item.quantity}
            </Text>
          </View>

          {/* Right Section: Price + Action Buttons */}
          <View className="items-center">
            {/* Price with colored background */}
            <View className="bg-blue-500 px-4 py-2 rounded-xl mb-3 shadow-md">
              <Text className="text-white font-bold text-lg">
                ${item.price.toFixed(2)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => onEdit(item)}
                className="p-3 bg-amber-100 rounded-xl shadow-sm"
              >
                <Ionicons name="pencil" size={18} color="#f59e0b" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                className="p-3 bg-red-100 rounded-xl shadow-sm"
              >
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ReceiptListItem;
