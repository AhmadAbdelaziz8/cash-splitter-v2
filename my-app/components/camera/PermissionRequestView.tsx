import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { PermissionStatus as CameraPermissionStatus } from "expo-camera";

interface PermissionRequestViewProps {
  permissionStatus: CameraPermissionStatus | string;
  requestPermission: () => Promise<void>;
}

export default function PermissionRequestView({
  permissionStatus,
  requestPermission,
}: PermissionRequestViewProps) {
  return (
    <View className="flex-1 justify-center items-center p-4 bg-gray-50">
      <Text className="text-lg mb-4 text-center text-gray-800">
        We need your permission to use the camera
      </Text>
      <Text className="text-sm mb-6 text-center text-gray-600">
        Permission status: {permissionStatus}
        {Platform.OS === "android" && ` (Android ${Platform.Version})`}
      </Text>
      <TouchableOpacity
        className="bg-sky-400 py-3 px-6 rounded-md"
        onPress={requestPermission}
      >
        <Text className="text-gray-800 font-bold text-center text-base">
          GRANT PERMISSION
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 py-2 px-4"
        onPress={() => Linking.openSettings()}
      >
        <Text className="text-sky-500 text-center">Open Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
