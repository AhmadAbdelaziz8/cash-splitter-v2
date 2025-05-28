import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Basic styling - can be replaced with NativeWind classes later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  linkContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    marginBottom: 20,
    width: "100%",
  },
  linkText: {
    fontSize: 16,
    color: "#007bff",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
});

const ShareLinkScreen: React.FC = () => {
  const { shareableLink, resetState } = useReceipt();

  const handleShare = async () => {
    if (!shareableLink) {
      Alert.alert("Error", "No link generated to share.");
      return;
    }
    try {
      await Share.share({
        message: `Here's the bill to split: ${shareableLink}`,
        url: shareableLink, // For some platforms
        title: "Split Bill",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the link.");
    }
  };

  const handleDone = () => {
    resetState(); // Clear receipt context
    router.replace("/(tabs)/"); // Navigate to home screen
  };

  if (!shareableLink) {
    // Should not happen if navigation is correct, but as a fallback
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Link Available</Text>
        <Text
          style={{ textAlign: "center", marginBottom: 20, color: "#6c757d" }}
        >
          Something went wrong, and the shareable link could not be generated.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleDone}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="checkmark-circle-outline"
        size={60}
        color="#28a745"
        style={{ marginBottom: 15 }}
      />
      <Text style={styles.title}>Link Generated Successfully!</Text>

      <Text
        style={{
          fontSize: 16,
          color: "#495057",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Share this link with your friends:
      </Text>

      <View style={styles.linkContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text selectable={true} style={styles.linkText}>
            {shareableLink}
          </Text>
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Share Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleDone}
      >
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Done (Back to Home)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareLinkScreen;
