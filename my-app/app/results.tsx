import React, { useState, useEffect } from "react";
import {
  FlatList,
  Share,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useReceipt, ReceiptItem } from "@/contexts/ReceiptContext";

// Define styles for non-compatible components
const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
});

export default function ResultsScreen() {
  const {
    items: contextItems,
    setItems: setContextItems,
    imageBase64,
  } = useReceipt();
  const [items, setItems] = useState(contextItems);
  const [people, setPeople] = useState<string[]>(["You"]);
  const [newPersonName, setNewPersonName] = useState<string>("");
  const [activePersonIndex, setActivePersonIndex] = useState<number>(0);
  const [showSplitSummary, setShowSplitSummary] = useState<boolean>(false);

  // Keep context in sync when items change
  useEffect(() => {
    setContextItems(items);
  }, [items]);

  const handleShare = async () => {
    try {
      // Format the bill splitting data for sharing
      const summary = calculateSplitSummary();
      let shareMessage = "Cash Splitter Summary:\n\n";

      summary.forEach((person) => {
        shareMessage += `${person.name}: $${person.amount.toFixed(2)}\n`;
        if (person.items.length > 0) {
          shareMessage += `Items: ${person.items.join(", ")}\n`;
        }
        shareMessage += "\n";
      });

      const result = await Share.share({
        message: shareMessage,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error sharing", errorMessage);
    }
  };

  const addPerson = () => {
    if (!newPersonName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    if (people.includes(newPersonName.trim())) {
      Alert.alert("Error", "This person is already added");
      return;
    }

    setPeople([...people, newPersonName.trim()]);
    setNewPersonName("");
  };

  const toggleItemSelection = (id: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          // If already assigned to this person, remove them
          const personName = people[activePersonIndex];
          const isAssigned = item.assignedTo.includes(personName);

          return {
            ...item,
            selected: !isAssigned,
            assignedTo: isAssigned
              ? item.assignedTo.filter((p) => p !== personName)
              : [...item.assignedTo, personName],
          };
        }
        return item;
      })
    );
  };

  const calculateSplitSummary = () => {
    const summary = people.map((person) => {
      const assignedItems = items.filter((item) =>
        item.assignedTo.includes(person)
      );

      const itemsTotal = assignedItems.reduce((sum, item) => {
        return sum + item.price / item.assignedTo.length;
      }, 0);

      return {
        name: person,
        amount: itemsTotal,
        items: assignedItems.map((i) => i.name),
      };
    });

    return summary;
  };

  const renderItem = ({ item }: { item: ReceiptItem }) => {
    const currentPerson = people[activePersonIndex];
    const isSelected = item.assignedTo.includes(currentPerson);
    const sharedCount = item.assignedTo.length;

    return (
      <TouchableOpacity
        onPress={() => toggleItemSelection(item.id)}
        className={`flex-row justify-between py-3 px-2 border-b border-gray-200 ${
          isSelected ? "bg-sky-50" : ""
        }`}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={22}
            color={isSelected ? "#0ea5e9" : "#6b7280"}
            style={{ marginRight: 8 }}
          />
          <View className="flex-1">
            <Text className="text-base text-gray-800">{item.name}</Text>
            {sharedCount > 1 && (
              <Text className="text-xs text-sky-500">
                Shared with {sharedCount} people ($
                {(item.price / sharedCount).toFixed(2)} each)
              </Text>
            )}
          </View>
        </View>
        <Text className="text-base font-bold text-gray-800">
          ${item.price.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPersonTab = (name: string, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => setActivePersonIndex(index)}
      className={`py-2 px-4 rounded-full mr-2 ${
        activePersonIndex === index ? "bg-sky-400" : "bg-gray-200"
      }`}
    >
      <Text
        className={`${
          activePersonIndex === index ? "text-gray-800" : "text-gray-600"
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <View className="flex-1 bg-gray-50">
      {!showSplitSummary ? (
        // Bill splitting screen
        <View className="flex-1 p-5">
          <View className="mb-2">
            <Text className="text-2xl font-bold mb-1 text-gray-800">
              Receipt Items
            </Text>
            <Text className="text-base text-gray-600 mb-3">
              Select items for each person
            </Text>

            {/* People tabs */}
            <View className="flex-row flex-wrap mb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {people.map((person, index) => renderPersonTab(person, index))}
              </ScrollView>
            </View>

            {/* Add person input */}
            <View className="flex-row mb-4">
              <TextInput
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-white text-gray-800"
                placeholder="Add person"
                placeholderTextColor="#9ca3af"
                value={newPersonName}
                onChangeText={setNewPersonName}
              />
              <TouchableOpacity
                className="bg-sky-400 px-4 justify-center items-center rounded-r-lg"
                onPress={addPerson}
              >
                <Text className="text-gray-800 font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="font-bold text-base text-gray-700 mb-1">
            Select items for {people[activePersonIndex]}:
          </Text>

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <View className="flex-row justify-between py-4 border-t-2 border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Total</Text>
            <Text className="text-lg font-bold text-gray-800">
              ${total.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between mt-5 gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center border-2 border-sky-400"
              onPress={() => router.push("/")}
            >
              <Text className="font-bold text-base text-sky-500">
                Back Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-400"
              onPress={() => setShowSplitSummary(true)}
            >
              <Text className="font-bold text-base text-gray-800">
                View Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Split summary screen
        <View className="flex-1 p-5">
          <View className="mb-5">
            <Text className="text-2xl font-bold mb-1 text-gray-800">
              Split Summary
            </Text>
            <Text className="text-base text-gray-600">
              Here's what each person owes
            </Text>
          </View>

          {calculateSplitSummary().map((person, index) => (
            <View
              key={index}
              className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-lg font-bold text-gray-800">
                  {person.name}
                </Text>
                <Text className="text-lg font-bold text-sky-500">
                  ${person.amount.toFixed(2)}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">
                {person.items.length > 0
                  ? `Items: ${person.items.join(", ")}`
                  : "No items selected"}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between mt-auto gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center border-2 border-sky-400"
              onPress={() => setShowSplitSummary(false)}
            >
              <Text className="font-bold text-base text-sky-500">
                Back to Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-400"
              onPress={handleShare}
            >
              <Text className="font-bold text-base text-gray-800">
                Share Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
