import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ShareLinkScreen: React.FC = () => {
  const { shareableLink, resetState } = useReceipt();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    if (!shareableLink) {
      Alert.alert("Error", "No link generated to share.");
      return;
    }
    try {
      await Share.share({
        message: `Here's the bill to split: ${shareableLink}`,
        url: shareableLink, // For iOS, url is more prominent
        title: "Split Bill", // For Android, title is shown
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the link.");
    }
  };

  const handleDone = () => {
    resetState();
    router.replace("/(tabs)/");
  };

  if (!shareableLink) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Ionicons name="alert-circle-outline" size={60} style={styles.errorIcon} />
        <Text style={styles.titleText}>No Link Available</Text>
        <Text style={styles.bodyText}>
          Something went wrong, and the shareable link could not be generated.
        </Text>
        <TouchableOpacity
          style={[styles.buttonBase, styles.secondaryButton, styles.fullWidthButton, styles.marginTopLarge]}
          onPress={handleDone}
        >
          <Ionicons name="home-outline" size={20} style={styles.buttonIconSecondary} />
          <Text style={styles.buttonTextSecondary}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom || 20, paddingTop: insets.top || 20}]}>
      <View style={styles.contentContainer}>
        <Ionicons
          name="checkmark-circle-outline"
          size={70}
          style={styles.successIcon}
        />
        <Text style={styles.titleText}>Link Generated!</Text>
        <Text style={styles.bodyText}>
          Share this link with your friends:
        </Text>
        <View style={styles.linkContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text selectable={true} style={styles.linkText}>
              {shareableLink}
            </Text>
          </ScrollView>
        </View>
        <TouchableOpacity
          style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton, styles.marginTopMedium]}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={22} style={styles.buttonIconPrimary} />
          <Text style={styles.buttonTextPrimary}>Share Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonBase, styles.secondaryButton, styles.fullWidthButton, styles.marginTopSmall]}
          onPress={handleDone}
        >
          <Ionicons name="checkmark-done-outline" size={22} style={styles.buttonIconSecondary} />
          <Text style={styles.buttonTextSecondary}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // slate-900
    paddingHorizontal: 20,
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    color: "#22c55e", // green-500
    marginBottom: 20,
  },
  errorIcon: {
    color: "#ef4444", // red-500
    marginBottom: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#f1f5f9", // slate-100
    marginBottom: 15,
  },
  bodyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#cbd5e1", // slate-300
    marginBottom: 25,
    lineHeight: 24,
  },
  linkContainer: {
    backgroundColor: "#1e293b", // slate-800
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155", // slate-700
    marginBottom: 25,
    width: "100%",
    minHeight: 60, // Ensure it's not too small
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 15, 
    color: "#38bdf8", // sky-400
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospaced font for link
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  fullWidthButton: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#3b82f6", // blue-500
  },
  secondaryButton: {
    backgroundColor: "#334155", // slate-700
  },
  buttonTextPrimary: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#e2e8f0", // slate-200
    fontSize: 17,
    fontWeight: "600",
  },
  buttonIconPrimary: {
    color: "#ffffff",
    marginRight: 10,
  },
  buttonIconSecondary: {
    color: "#e2e8f0", // slate-200
    marginRight: 10,
  },
  marginTopLarge: {
    marginTop: 30,
  },
  marginTopMedium: {
    marginTop: 20,
  },
  marginTopSmall: {
    marginTop: 12,
  },
});

export default ShareLinkScreen;
