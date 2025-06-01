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
      icon: "information-circle-outline",
      title: "Welcome to Cash Splitter!",
      description:
        "To get started, you'll need a free Google Gemini API key to power our AI receipt scanning.",
      action: "Get Started",
      color: "#0ea5e9",
    },
    {
      icon: "globe-outline",
      title: "Visit Google AI Studio",
      description:
        "Click below to open Google AI Studio where you can create your free API key.",
      action: "Open AI Studio",
      color: "#10b981",
    },
    {
      icon: "key-outline",
      title: "Enter Your API Key",
      description:
        "Copy your API key from Google AI Studio and paste it below. It will be stored securely on your device.",
      action: "Continue",
      color: "#f59e0b",
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
        setCurrentStep(2);
        setShowInput(true);
      } else {
        Alert.alert("Cannot Open Link", `Please manually visit: ${url}`, [
          { text: "OK" },
        ]);
        setCurrentStep(2);
        setShowInput(true);
      }
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
        onApiKeySaved(apiKeyInput.trim());

        // Success animation
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
        ]).start();

        Alert.alert(
          "Success!",
          "Your API key has been saved. You can now start scanning receipts!"
        );
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
              index <= currentStep ? "bg-sky-500" : "bg-slate-300"
            }`}
            style={{
              transform: [
                {
                  scale: index === currentStep ? 1.2 : 1,
                },
              ],
            }}
          />
          {index < steps.length - 1 && (
            <View className="w-8 h-0.5 bg-slate-300 mx-2">
              <Animated.View
                className="h-full bg-sky-500"
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
      className="w-full p-6 bg-sky-50 rounded-2xl shadow-lg border border-sky-100"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      {renderStepIndicator()}

      <View className="items-center mb-6">
        <Animated.View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: currentStepData.color + "20",
            transform: [
              {
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        >
          <Ionicons
            name={currentStepData.icon as any}
            size={40}
            color={currentStepData.color}
          />
        </Animated.View>

        <Text className="text-2xl font-bold text-slate-800 text-center mb-3">
          {currentStepData.title}
        </Text>

        <Text className="text-base text-slate-600 text-center leading-6 mb-6">
          {currentStepData.description}
        </Text>
      </View>

      {showInput && currentStep === 2 && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TextInput
            className="bg-white border-2 border-sky-200 rounded-xl p-4 mb-4 text-base text-slate-900 shadow-sm"
            placeholder="Paste your Google Gemini API Key here"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            secureTextEntry={true}
            autoCapitalize="none"
            placeholderTextColor="#94a3b8"
            multiline={false}
          />
          <View className="flex-row items-center mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
            <Text className="text-sm text-amber-800 ml-2 flex-1">
              Your API key is stored securely on this device only
            </Text>
          </View>
        </Animated.View>
      )}

      <TouchableOpacity
        className={`py-4 px-6 rounded-xl items-center justify-center shadow-lg ${
          isSaving
            ? "bg-slate-400"
            : currentStep === 1
            ? "bg-green-500 active:bg-green-600"
            : currentStep === 2
            ? "bg-amber-500 active:bg-amber-600"
            : "bg-sky-500 active:bg-sky-600"
        }`}
        onPress={handleStepAction}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-bold mr-2">
              {currentStepData.action}
            </Text>
            <Ionicons
              name={currentStep === 1 ? "open-outline" : "arrow-forward"}
              size={20}
              color="white"
            />
          </View>
        )}
      </TouchableOpacity>

      {currentStep === 1 && (
        <TouchableOpacity
          className="mt-4 py-2"
          onPress={() => {
            setCurrentStep(2);
            setShowInput(true);
          }}
        >
          <Text className="text-sky-600 text-center text-sm">
            I already have an API key
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
