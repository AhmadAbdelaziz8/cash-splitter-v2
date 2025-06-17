import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveApiKey } from "@/services/apiKeyService";

interface ApiKeySetupProps {
  onApiKeySaved: (apiKey: string) => void;
}

export default function ApiKeySetup({ onApiKeySaved }: ApiKeySetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const stepIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Step indicator animation
    Animated.timing(stepIndicatorAnim, {
      toValue: currentStep,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const steps = [
    {
      icon: "information-circle-outline" as const,
      title: "Welcome to Cash Splitter!",
      description:
        "To get started, you'll need a free Google Gemini API key to power our AI receipt scanning.",
      action: "Get Started",
      color: "#0ea5e9",
      darkColor: "#38bdf8",
    },
    {
      icon: "globe-outline" as const,
      title: "Visit Google AI Studio",
      description:
        "Click below to open Google AI Studio where you can create your free API key.",
      action: "Open AI Studio",
      color: "#10b981",
      darkColor: "#34d399",
    },
    {
      icon: "key-outline" as const,
      title: "Enter Your API Key",
      description:
        "Copy your API key from Google AI Studio and paste it below. It will be stored securely on your device.",
      action: "Continue",
      color: "#f59e0b",
      darkColor: "#fbbf24",
    },
  ];

  const handleStepAction = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Open Google AI Studio
      const url = "https://aistudio.google.com/app/apikey";
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      }
      setCurrentStep(2);
      // Show input field with a slight delay for smoother transition
      setTimeout(() => setShowInput(true), 100);
    } else if (currentStep === 2) {
      // Save API key
      if (!apiKeyInput.trim()) {
        Alert.alert(
          "API Key Required",
          "Please enter your Google Gemini API Key."
        );
        return;
      }

      setIsSaving(true);
      try {
        await saveApiKey(apiKeyInput.trim());
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onApiKeySaved(apiKeyInput.trim());
          Alert.alert(
            "Success!",
            "Your API key has been saved. You can now start scanning receipts!"
          );
        });
      } catch (error) {
        Alert.alert("Error", "Failed to save API key. Please try again.");
        setIsSaving(false);
      }
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-8">
      {steps.map((_, index) => (
        <View key={index} className="flex-row items-center">
          <Animated.View
            className={`w-3 h-3 rounded-full ${
              index <= currentStep ? "bg-sky-500 dark:bg-sky-400" : "bg-slate-300 dark:bg-slate-600"
            }`}
            style={{
              transform: [
                {
                  scale: stepIndicatorAnim.interpolate({
                    inputRange: [index - 1, index, index + 1],
                    outputRange: [1, 1.3, 1],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          />
          {index < steps.length - 1 && (
            <View className="w-8 h-1 bg-slate-300 dark:bg-slate-600 mx-2 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-sky-500 dark:bg-sky-400"
                style={{
                  width: stepIndicatorAnim.interpolate({
                    inputRange: [index, index + 1],
                    outputRange: ["0%", "100%"],
                    extrapolate: "clamp",
                  }),
                }}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const currentStepData = steps[currentStep];

  return (
    <Animated.View
      className="w-full p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      {renderStepIndicator()}

      <View className="items-center mb-6">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-5"
        >
          <View className="w-full h-full rounded-full items-center justify-center bg-opacity-20 dark:bg-opacity-20" style={{ backgroundColor: currentStepData.color + '33'}}>
             <Ionicons
              name={currentStepData.icon}
              size={40}
              className="text-sky-500 dark:text-sky-400"
            />
          </View>
        </View>

        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-3">
          {currentStepData.title}
        </Text>

        <Text className="text-base text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-8">
          {currentStepData.description}
        </Text>
      </View>

      {currentStep === 2 && (
          <Animated.View 
            className="mb-6"
            style={{ 
              opacity: showInput ? fadeAnim : 0,
              transform: [{translateY: showInput ? slideAnim : 30}]
            }}
          >
            <TextInput
              className="bg-slate-50 dark:bg-slate-700 border-2 border-sky-300 dark:border-sky-600 rounded-xl p-4 mb-4 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400"
              placeholder="Paste your Google Gemini API Key here"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={true}
              autoCapitalize="none"
              multiline={false}
            />
            <View className="flex-row items-center p-3 bg-amber-100 dark:bg-amber-800/50 border border-amber-300 dark:border-amber-700 rounded-lg">
              <Ionicons name="shield-checkmark-outline" size={20} className="text-amber-600 dark:text-amber-400" />
              <Text className="text-sm text-amber-700 dark:text-amber-300 ml-2 flex-1">
                Your API key is stored securely on this device only and never shared.
              </Text>
            </View>
          </Animated.View>
      )}

      <TouchableOpacity
        className={`w-full py-4 px-6 rounded-xl shadow-md active:opacity-80 ${
          isSaving ? "bg-slate-400 dark:bg-slate-600" : "bg-sky-500 dark:bg-sky-600"
        }`}
        onPress={handleStepAction}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <View className="flex-row items-center justify-center">
            <Text className="text-white font-bold text-lg mr-2">
              {currentStepData.action}
            </Text>
            <Ionicons 
              name={currentStep === 0 ? "arrow-forward-outline" : currentStep === 1 ? "open-outline" : "checkmark-done-outline"} 
              size={20} 
              color="white" 
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
