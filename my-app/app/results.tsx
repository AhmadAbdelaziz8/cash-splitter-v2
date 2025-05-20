import {
  FlatList,
  Share,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

// Define the type for receipt items
interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

// Mock data to simulate parsed receipt
const MOCK_ITEMS: ReceiptItem[] = [
  { id: "1", name: "Burger", price: 10.99 },
  { id: "2", name: "Fries", price: 3.5 },
  { id: "3", name: "Soda", price: 2.5 },
  { id: "4", name: "Ice Cream", price: 4.99 },
  { id: "5", name: "Coffee", price: 3.99 },
];

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
  const handleBack = () => {
    router.push("/");
  };

  const handleShare = async () => {
    try {
      // In a real app, we would generate the actual link with the receipt data
      const mockReceiptData = encodeURIComponent(JSON.stringify(MOCK_ITEMS));
      const shareUrl = `https://your-static-site.com/splitter.html#data=${mockReceiptData}`;

      const result = await Share.share({
        message: "Split your bill with Cash Splitter!",
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType);
        } else {
          // shared
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log("Share dismissed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error sharing: " + errorMessage);
    }
  };

  const renderItem = ({ item }: { item: ReceiptItem }) => (
    <View className="flex-row justify-between py-3 px-1 border-b border-gray-200">
      <Text className="text-base">{item.name}</Text>
      <Text className="text-base font-bold">${item.price.toFixed(2)}</Text>
    </View>
  );

  // Calculate total
  const total = MOCK_ITEMS.reduce((sum, item) => sum + item.price, 0);

  return (
    <View className="flex-1 p-5">
      <View className="mb-5">
        <Text className="text-2xl font-bold mb-1">Receipt Items</Text>
        <Text className="text-base opacity-70">
          We found the following items on your receipt
        </Text>
      </View>

      <FlatList
        data={MOCK_ITEMS}
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
          <Text className="font-bold text-base text-sky-600">Back Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-4 rounded-lg items-center justify-center bg-sky-600"
          onPress={handleShare}
        >
          <Text className="font-bold text-base text-white">Share Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
