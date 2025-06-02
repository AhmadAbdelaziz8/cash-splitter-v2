import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
    let displayText = "Service Charge:";

    if (typeof serviceCharge === "number") {
      displayAmount = serviceCharge;
      displayText = "Service (Fixed):";
    } else if (
      typeof serviceCharge === "string" &&
      serviceCharge.includes("%")
    ) {
      const percentage = parseFloat(serviceCharge.replace("%", ""));
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

  const renderTotalRow = (label: string, value: string, isEmphasized: boolean = false, onEdit?: () => void) => (
    <View style={styles.rowContainer}>
      <View style={styles.labelContainer}>
        <Text style={isEmphasized ? styles.labelTextEmphasized : styles.labelText}>{label}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil-outline" size={18} style={styles.editIcon} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={isEmphasized ? styles.valueTextEmphasized : styles.valueText}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderTotalRow("Items Subtotal:", `$${itemsSubtotal.toFixed(2)}`)}
      {renderTotalRow("Tax:", `$${(tax ?? 0).toFixed(2)}`, false, onEditTax)}
      {renderTotalRow(serviceDisplayText, `$${serviceDisplayAmount.toFixed(2)}`, false, onEditService)}

      {originalReceiptTotal !== null && grandTotal !== originalReceiptTotal && (
        <View style={styles.originalTotalContainer}>
            <Text style={styles.originalTotalLabel}>Original Receipt Total:</Text>
            <Text style={styles.originalTotalValue}>${originalReceiptTotal.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.grandTotalSeparator} />
      {renderTotalRow("Final Grand Total:", `$${grandTotal.toFixed(2)}`, true)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    backgroundColor: "#1e293b",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 16,
    color: "#cbd5e1",
  },
  labelTextEmphasized: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e2e8f0",
  },
  valueTextEmphasized: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: "#334155",
    borderRadius: 6,
  },
  editIcon: {
    color: "#94a3b8",
  },
  originalTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#334155",
    borderRadius: 6,
  },
  originalTotalLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  originalTotalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#cbd5e1",
  },
  grandTotalSeparator: {
    height: 1,
    backgroundColor: "#475569",
    marginVertical: 10,
  },
});

export default ReceiptTotalsFooter;
