import { StyleSheet, TouchableOpacity, FlatList, Share } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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

export default function ResultsScreen() {
  const colorScheme = useColorScheme();

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
    <ThemedView style={styles.itemContainer}>
      <ThemedText style={styles.itemName}>{item.name}</ThemedText>
      <ThemedText style={styles.itemPrice}>${item.price.toFixed(2)}</ThemedText>
    </ThemedView>
  );

  // Calculate total
  const total = MOCK_ITEMS.reduce((sum, item) => sum + item.price, 0);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>Receipt Items</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          We found the following items on your receipt
        </ThemedText>
      </ThemedView>

      <FlatList
        data={MOCK_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <ThemedView style={styles.totalContainer}>
        <ThemedText style={styles.totalLabel}>Total</ThemedText>
        <ThemedText style={styles.totalAmount}>${total.toFixed(2)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleBack}
        >
          <ThemedText
            style={[
              styles.buttonText,
              { color: Colors[colorScheme ?? "light"].tint },
            ]}
          >
            Back Home
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={handleShare}
        >
          <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
            Share Link
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#0a7ea4",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  primaryButtonText: {
    color: "white",
  },
});
