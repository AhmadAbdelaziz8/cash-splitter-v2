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

  // Check if we have image data from processing
  useEffect(() => {
    if (!imageBase64) {
      console.log("No image data available, using mock data");
      // No need to navigate away since we're using mock data for now
    }
  }, [imageBase64]);

  // Keep context in sync when items change
  useEffect(() => {
    setContextItems(items);
  }, [items]);

  const handleBack = () => {
    router.push("/");
  };

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

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared");
        }
      }
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
        // If an item is shared among multiple people, split its cost
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
            color={isSelected ? "#0a7ea4" : "#687076"}
            style={{ marginRight: 8 }}
          />
          <View className="flex-1">
            <Text className="text-base">{item.name}</Text>
            {sharedCount > 1 && (
              <Text className="text-xs text-sky-600">
                Shared with {sharedCount} people ($
                {(item.price / sharedCount).toFixed(2)} each)
              </Text>
            )}
          </View>
        </View>
        <Text className="text-base font-bold">${item.price.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  const renderPersonTab = (name: string, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => setActivePersonIndex(index)}
      className={`py-2 px-4 rounded-full mr-2 ${
        activePersonIndex === index ? "bg-sky-600" : "bg-gray-200"
      }`}
    >
      <Text
        className={`${
          activePersonIndex === index ? "text-white" : "text-gray-700"
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <View className="flex-1">
      {!showSplitSummary ? (
        // Bill splitting screen
        <View className="flex-1 p-5">
          <View className="mb-2">
            <Text className="text-2xl font-bold mb-1">Receipt Items</Text>
            <Text className="text-base opacity-70 mb-3">
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
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                placeholder="Add person"
                value={newPersonName}
                onChangeText={setNewPersonName}
              />
              <TouchableOpacity
                className="bg-sky-600 px-4 justify-center items-center rounded-r-lg"
                onPress={addPerson}
              >
                <Text className="text-white font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="font-bold text-base opacity-80 mb-1">
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
            <Text className="text-lg font-bold">Total</Text>
            <Text className="text-lg font-bold">${total.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mt-5 gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center border-2 border-sky-600"
              onPress={handleBack}
            >
              <Text className="font-bold text-base text-sky-600">
                Back Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-600"
              onPress={() => setShowSplitSummary(true)}
            >
              <Text className="font-bold text-base text-white">
                View Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Split summary screen
        <View className="flex-1 p-5">
          <View className="mb-5">
            <Text className="text-2xl font-bold mb-1">Split Summary</Text>
            <Text className="text-base opacity-70">
              Here's what each person owes
            </Text>
          </View>

          {calculateSplitSummary().map((person, index) => (
            <View
              key={index}
              className="mb-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-lg font-bold">{person.name}</Text>
                <Text className="text-lg font-bold text-sky-600">
                  ${person.amount.toFixed(2)}
                </Text>
              </View>
              <Text className="text-sm opacity-70">
                {person.items.length > 0
                  ? `Items: ${person.items.join(", ")}`
                  : "No items selected"}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between mt-auto gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center border-2 border-sky-600"
              onPress={() => setShowSplitSummary(false)}
            >
              <Text className="font-bold text-base text-sky-600">
                Back to Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-600"
              onPress={handleShare}
            >
              <Text className="font-bold text-base text-white">
                Share Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
