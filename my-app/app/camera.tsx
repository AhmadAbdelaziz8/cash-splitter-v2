import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";

import PermissionRequestView from "@/components/camera/PermissionRequestView";
import CameraTopControls from "@/components/camera/CameraTopControls";
import CameraBottomControls from "@/components/camera/CameraBottomControls";
import { useCameraLogic } from "@/hooks/useCameraLogic";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();

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
  } = useCameraLogic();

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
    <View className="flex-1 bg-white">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={handleCameraReady}
        autofocus="on"
        onMountError={handleCameraMountError}
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
