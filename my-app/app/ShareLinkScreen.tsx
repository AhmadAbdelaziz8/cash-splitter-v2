import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ShareLinkScreen: React.FC = () => {
  const { shareableLink, resetState } = useReceipt();

  const handleShare = async () => {
    if (!shareableLink) {
      Alert.alert("Error", "No link generated to share.");
      return;
    }
    try {
      await Share.share({
        message: `Here\'s the bill to split: ${shareableLink}`,
        url: shareableLink,
        title: "Split Bill",
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
      <View className="flex-1 p-5 justify-center items-center bg-slate-50">
        <Text className="text-2xl font-bold mb-5 text-center text-slate-700">
          No Link Available
        </Text>
        <Text className="text-center mb-5 text-slate-500">
          Something went wrong, and the shareable link could not be generated.
        </Text>
        <TouchableOpacity
          className="bg-slate-500 py-3 px-5 rounded-lg items-center flex-row justify-center w-full mb-3"
          onPress={handleDone}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text className="text-white text-base font-bold ml-2">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5 justify-center items-center bg-slate-50">
      <Ionicons
        name="checkmark-circle-outline"
        size={60}
        color="#28a745"
        className="mb-4"
      />
      <Text className="text-2xl font-bold mb-5 text-center text-slate-700">
        Link Generated Successfully!
      </Text>
      <Text className="text-base text-slate-600 text-center mb-2">
        Share this link with your friends:
      </Text>
      <View className="bg-white p-4 rounded-lg border border-slate-300 mb-5 w-full">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text
            selectable={true}
            className="text-base text-blue-500 text-center"
          >
            {shareableLink}
          </Text>
        </ScrollView>
      </View>
      <TouchableOpacity
        className="bg-green-500 py-3 px-5 rounded-lg items-center flex-row justify-center w-full mb-3"
        onPress={handleShare}
      >
        <Ionicons name="share-social-outline" size={20} color="#fff" />
        <Text className="text-white text-base font-bold ml-2">Share Link</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-slate-500 py-3 px-5 rounded-lg items-center flex-row justify-center w-full mb-3"
        onPress={handleDone}
      >
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text className="text-white text-base font-bold ml-2">
          Done (Back to Home)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareLinkScreen;
