import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ReceiptProvider } from "@/contexts/ReceiptContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // This effect will run when the layout is first rendered.
  useEffect(() => {
    // Hide the splash screen after the component has mounted
    // In a real app, you might want to wait for fonts, authentication, etc.
    const hideSplashScreen = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error hiding splash screen:", error);
        // Hide it anyway to prevent infinite loading
        await SplashScreen.hideAsync();
      }
    };

    hideSplashScreen();
  }, []);

  return (
    <ReceiptProvider>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <SafeAreaView className="flex-1 bg-white">
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="camera" options={{ headerShown: false }} />
              <Stack.Screen name="preview" options={{ headerShown: false }} />
              <Stack.Screen
                name="EditItemsScreen"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ShareLinkScreen"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="dark" />
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ReceiptProvider>
  );
}
