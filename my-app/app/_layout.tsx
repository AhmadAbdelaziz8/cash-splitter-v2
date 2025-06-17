import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ReceiptProvider } from "@/contexts/ReceiptContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ReceiptProvider>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          {/* FIX: Add flex:1 to SafeAreaView */}
          <SafeAreaView style={{ flex: 1 }}>
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
            {/* FIX: Move StatusBar inside SafeAreaView */}
            <StatusBar style="dark" />
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ReceiptProvider>
  );
}
