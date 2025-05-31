import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ReceiptTotalsFooterProps {
  itemsSubtotal: number;
  tax: number | null;
  serviceCharge: number | string | null;
  originalReceiptTotal: number | null;
  grandTotal: number;
  onEditTax: () => void;
  onEditService: () => void;
}

const ReceiptTotalsFooter: React.FC<ReceiptTotalsFooterProps> = ({
  itemsSubtotal,
  tax,
  serviceCharge,
  originalReceiptTotal,
  grandTotal,
  onEditTax,
  onEditService,
}) => {
  const { serviceDisplayAmount, serviceDisplayText } = useMemo(() => {
    let displayAmount = 0;
    let displayText = "Service:";

    if (typeof serviceCharge === "number") {
      displayAmount = serviceCharge;
      displayText = "Service (Fixed):";
    } else if (
      typeof serviceCharge === "string" &&
      serviceCharge.includes("%")
    ) {
      const percentage = parseFloat(serviceCharge);
      if (!isNaN(percentage)) {
        displayAmount = (percentage / 100) * itemsSubtotal;
        displayText = `Service (${serviceCharge}):`;
      }
    }
    return {
      serviceDisplayAmount: displayAmount,
      serviceDisplayText: displayText,
    };
  }, [serviceCharge, itemsSubtotal]);

  return (
    <View className="mt-6 pt-4 border-t border-slate-300">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base text-slate-600">Items Subtotal:</Text>
        <Text className="text-base font-semibold text-slate-700">
          ${itemsSubtotal.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center">
          <Text className="text-base text-slate-600 mr-2">Tax:</Text>
          <TouchableOpacity
            onPress={onEditTax}
            className="p-1.5 bg-slate-100 rounded-lg active:bg-slate-200"
          >
            <Ionicons name="pencil" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
        <Text className="text-base font-semibold text-slate-700">
          ${(tax ?? 0).toFixed(2)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center">
          <Text className="text-base text-slate-600 mr-2">
            {serviceDisplayText}
          </Text>
          <TouchableOpacity
            onPress={onEditService}
            className="p-1.5 bg-slate-100 rounded-lg active:bg-slate-200"
          >
            <Ionicons name="pencil" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
        <Text className="text-base font-semibold text-slate-700">
          ${serviceDisplayAmount.toFixed(2)}
        </Text>
      </View>

      {originalReceiptTotal !== null && (
        <View className="flex-row justify-between items-center mb-1 mt-1 opacity-70">
          <Text className="text-sm text-slate-500">
            Original Receipt Total:
          </Text>
          <Text className="text-sm font-semibold text-slate-600">
            ${originalReceiptTotal.toFixed(2)}
          </Text>
        </View>
      )}

      <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-200">
        <Text className="text-lg font-bold text-slate-800">
          Final Grand Total:
        </Text>
        <Text className="text-lg font-bold text-slate-800">
          ${grandTotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export default ReceiptTotalsFooter;
