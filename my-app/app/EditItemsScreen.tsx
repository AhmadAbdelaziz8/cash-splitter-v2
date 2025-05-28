import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Basic styling - can be replaced with NativeWind classes later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#343a40",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  itemName: {
    fontSize: 16,
    flex: 1,
    color: "#495057",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtotalContainer: {
    marginTop: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    color: "#28a745",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 10,
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
});

const EditItemsScreen: React.FC = () => {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleUserItemSelection,
    userSelectedItemIds,
    userSubtotal,
    generateShareableLink,
  } = useReceipt();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReceiptItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const openModalToAdd = () => {
    setCurrentItem(null);
    setItemName("");
    setItemPrice("");
    setModalVisible(true);
  };

  const openModalToEdit = (item: ReceiptItem) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setModalVisible(true);
  };

  const handleSaveItem = () => {
    const price = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(price) || price < 0) {
      Alert.alert("Invalid Input", "Please enter a valid name and price.");
      return;
    }

    if (currentItem) {
      updateItem(currentItem.id, { name: itemName, price });
    } else {
      addItem({ name: itemName, price });
    }
    setModalVisible(false);
    setItemName("");
    setItemPrice("");
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteItem(id), style: "destructive" },
    ]);
  };

  const handleFinalize = () => {
    generateShareableLink();
    router.push("/ShareLinkScreen"); // Navigate to the new share screen
  };

  const renderItemRow = ({ item }: { item: ReceiptItem }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        onPress={() => toggleUserItemSelection(item.id)}
        style={styles.actionsContainer}
      >
        <Ionicons
          name={
            userSelectedItemIds.includes(item.id)
              ? "checkbox"
              : "square-outline"
          }
          size={24}
          color={userSelectedItemIds.includes(item.id) ? "#007bff" : "#6c757d"}
        />
      </TouchableOpacity>
      <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        onPress={() => openModalToEdit(item)}
        style={styles.iconButton}
      >
        <Ionicons name="pencil" size={20} color="#ffc107" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteItem(item.id)}
        style={styles.iconButton}
      >
        <Ionicons name="trash" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Receipt Items</Text>

      <FlatList
        data={items}
        renderItem={renderItemRow}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginVertical: 20,
              fontSize: 16,
              color: "#6c757d",
            }}
          >
            No items yet. Add some!
          </Text>
        }
      />

      <TouchableOpacity style={styles.button} onPress={openModalToAdd}>
        <Text style={styles.buttonText}>Add New Item</Text>
      </TouchableOpacity>

      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>
          Your Subtotal: ${userSubtotal.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleFinalize}
        disabled={items.length === 0}
      >
        <Text style={styles.buttonText}>Finalize & Get Link</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentItem ? "Edit Item" : "Add New Item"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.button, { width: "100%" }]}
              onPress={handleSaveItem}
            >
              <Text style={styles.buttonText}>Save Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#6c757d", width: "100%", marginTop: 10 },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditItemsScreen;
