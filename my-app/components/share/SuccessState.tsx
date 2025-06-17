import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SuccessStateProps {
  shareableLink: string;
  onShare: () => void;
  onDone: () => void;
}

export default function SuccessState({
  shareableLink,
  onShare,
  onDone,
}: SuccessStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-5">
      <Ionicons
        name="checkmark-circle-outline"
        size={70}
        color="#22c55e"
        className="mb-5"
      />
      
      <Text className="text-3xl font-bold text-slate-100 text-center mb-4">
        Link Generated!
      </Text>
      
      <Text className="text-base text-slate-300 text-center mb-6 leading-6">
        Share this link with your friends:
      </Text>
      
      <View className="bg-slate-800 py-4 px-5 rounded-xl border border-slate-700 mb-8 w-full min-h-[60px] justify-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text 
            selectable={true} 
            className="text-sky-400 text-sm font-mono"
          >
            {shareableLink}
          </Text>
        </ScrollView>
      </View>
      
      <TouchableOpacity
        className="bg-blue-600 flex-row items-center justify-center py-4 px-6 rounded-xl w-full mb-3 shadow-lg"
        onPress={onShare}
      >
        <Ionicons 
          name="share-social-outline" 
          size={22} 
          color="white" 
          className="mr-3" 
        />
        <Text className="text-white text-lg font-semibold">
          Share Link
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-slate-700 flex-row items-center justify-center py-4 px-6 rounded-xl w-full shadow-lg"
        onPress={onDone}
      >
        <Ionicons 
          name="checkmark-done-outline" 
          size={22} 
          color="#e2e8f0" 
          className="mr-3" 
        />
        <Text className="text-slate-200 text-lg font-semibold">
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );
} 