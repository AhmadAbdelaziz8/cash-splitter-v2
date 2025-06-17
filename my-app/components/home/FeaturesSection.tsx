import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <View className="mt-16">
      <Text className="text-xl font-bold text-slate-800 mb-4 text-center">
        How It Works
      </Text>
      <Text className="text-sm text-slate-500 mb-12 text-center max-w-xl mx-auto px-4">
        Splitting bills is now simpler than ever. Just follow these easy steps.
      </Text>
      <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <View
            key={index}
            className="flex-row gap-4 py-8 px-3 bg-white rounded-2xl shadow-lg items-start space-x-6 mx-2 mb-4"
          >
            {/* Icon */}
            <View className="flex-shrink-0 w-16 h-16 rounded-full bg-sky-100 items-center justify-center shadow-md gap-2">
              <Ionicons name={feature.icon} size={28} color="#0ea5e9" />
            </View>
            {/* Content */}
            <View className="flex-1">
              <Text className="font-bold text-lg text-slate-700 mb-2">
                {feature.title}
              </Text>
              <Text className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
