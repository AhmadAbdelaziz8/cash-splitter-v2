import { router } from "expo-router";
import { View, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";

import PermissionRequestView from "@/components/camera/PermissionRequestView";
import CameraTopControls from "@/components/camera/CameraTopControls";
import CameraBottomControls from "@/components/camera/CameraBottomControls";
import { useCameraLogic } from "@/hooks/useCameraLogic";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [cameraKey, setCameraKey] = useState(0);

  const {
    cameraRef,
    facing,
    permission,
    permissionStatus,
    isCameraReady,
    isCapturing,
    requestCameraPermission,
    handleCameraReady,
    toggleCameraFacing,
    handleCapturePhoto,
    handleSelectFromGallery,
    handleCameraMountError,
    resumeCameraPreview,
    pauseCameraPreview,
  } = useCameraLogic();

  // Reset camera state when screen comes into focus by changing the key
  useFocusEffect(
    useCallback(() => {
      console.log("CAMERA_DEBUG: Camera screen focused, forcing remount.");
      setCameraKey((prevKey) => prevKey + 1);
      return () => {
        console.log("CAMERA_DEBUG: Camera screen unfocused.");
      };
    }, [])
  );

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-800">Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <PermissionRequestView
        permissionStatus={permissionStatus}
        requestPermission={requestCameraPermission}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={handleCameraReady}
        autofocus="on"
        onMountError={handleCameraMountError}
        animateShutter={true}
        enableTorch={false}
        flash="off"
        mode="picture"
      />

      <CameraTopControls
        onBack={() => router.back()}
        onToggleFacing={toggleCameraFacing}
        insetsTop={insets.top}
      />

      <CameraBottomControls
        onCapturePhoto={handleCapturePhoto}
        onSelectFromGallery={handleSelectFromGallery}
        isCameraReady={isCameraReady}
        isCapturing={isCapturing}
        insetsBottom={insets.bottom}
      />
    </View>
  );
}
