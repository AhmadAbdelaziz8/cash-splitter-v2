import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreviewHeaderProps {
  onBackPress: () => void;
  disabled?: boolean;
  topInset: number;
}

export default function PreviewHeader({
  onBackPress,
  disabled = false,
  topInset,
}: PreviewHeaderProps) {
  return (
    <TouchableOpacity
      style={{ top: topInset + 10 }}
      className="absolute left-4 z-10 bg-white/90 p-3 rounded-full shadow-lg border border-slate-200"
      onPress={onBackPress}
      disabled={disabled}
    >
      <Ionicons name="arrow-back-outline" size={28} color="#475569" />
    </TouchableOpacity>
  );
}
 