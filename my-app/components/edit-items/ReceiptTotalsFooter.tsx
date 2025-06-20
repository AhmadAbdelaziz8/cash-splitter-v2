import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ReceiptTotalsFooterProps {
  itemsSubtotal: number;
  tax: string | null;
  serviceCharge: number | null;
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
  const { taxDisplayAmount, taxDisplayText } = useMemo(() => {
    let displayAmount = 0;
    let displayText = "Tax:";

    if (typeof tax === "string" && tax.includes("%")) {
      const percentage = parseFloat(tax.replace("%", ""));
      if (!isNaN(percentage)) {
        displayAmount = (percentage / 100) * itemsSubtotal;
        displayText = `Tax (${tax}):`;
      }
    }
    return {
      taxDisplayAmount: displayAmount,
      taxDisplayText: displayText,
    };
  }, [tax, itemsSubtotal]);

  const { serviceDisplayAmount, serviceDisplayText } = useMemo(() => {
    let displayAmount = 0;
    let displayText = "Service Charge:";

    if (typeof serviceCharge === "number") {
      displayAmount = serviceCharge;
      displayText = "Service (Fixed):";
    }
    return {
      serviceDisplayAmount: displayAmount,
      serviceDisplayText: displayText,
    };
  }, [serviceCharge]);

  const renderTotalRow = (
    label: string,
    value: string,
    isEmphasized: boolean = false,
    onEdit?: () => void
  ) => (
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-row items-center">
        <Text
          className={
            isEmphasized
              ? "text-lg font-bold text-slate-900"
              : "text-base text-slate-600"
          }
        >
          {label}
        </Text>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            className="ml-3 p-1 bg-slate-100 rounded"
          >
            <Ionicons name="pencil-outline" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
      <Text
        className={
          isEmphasized
            ? "text-lg font-bold text-slate-900"
            : "text-base font-medium text-slate-700"
        }
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View className="mt-5 pt-4 border-t border-slate-200 bg-white px-4 pb-3 rounded-lg shadow-sm">
      {renderTotalRow("Items Subtotal:", `$${itemsSubtotal.toFixed(2)}`)}
      {renderTotalRow(
        taxDisplayText,
        `$${taxDisplayAmount.toFixed(2)}`,
        false,
        onEditTax
      )}
      {renderTotalRow(
        serviceDisplayText,
        `$${serviceDisplayAmount.toFixed(2)}`,
        false,
        onEditService
      )}

      {originalReceiptTotal !== null && grandTotal !== originalReceiptTotal && (
        <View className="flex-row justify-between items-center mt-2 mb-3 py-2 px-3 bg-slate-100 rounded">
          <Text className="text-sm text-slate-600">
            Original Receipt Total:
          </Text>
          <Text className="text-sm font-medium text-slate-700">
            ${originalReceiptTotal.toFixed(2)}
          </Text>
        </View>
      )}

      <View className="h-px bg-slate-300 my-3" />
      {renderTotalRow("Final Grand Total:", `$${grandTotal.toFixed(2)}`, true)}
    </View>
  );
};

export default ReceiptTotalsFooter;
