import React from "react";
import { View, Share, Alert } from "react-native";
import { useReceipt } from "@/contexts/ReceiptContext";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SuccessState from "@/components/share/SuccessState";
import ShareErrorState from "@/components/share/ShareErrorState";

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
    router.replace("/(tabs)");
  };

  return (
    <View
      style={{
        paddingBottom: insets.bottom || 20,
        paddingTop: insets.top || 20,
      }}
      className="flex-1 bg-slate-900 px-5"
    >
      {!shareableLink ? (
        <ShareErrorState onDone={handleDone} />
      ) : (
        <SuccessState
          shareableLink={shareableLink}
          onShare={handleShare}
          onDone={handleDone}
        />
      )}
    </View>
  );
};

export default ShareLinkScreen;
