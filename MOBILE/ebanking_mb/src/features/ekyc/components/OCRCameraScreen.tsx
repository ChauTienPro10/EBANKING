/**
 * OCR Camera Screen
 * Capture front and back of CMND/CCCD using react-native-vision-camera
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../constants/color';
import ProgressHeader from './shared/ProgressHeader';
import PermissionView from './ocr-camera/PermissionView';
import PreviewView from './ocr-camera/PreviewView';
import CompleteView from './ocr-camera/CompleteView';
import CameraView from './ocr-camera/CameraView';

type CaptureState = 'front' | 'back' | 'complete';

const OCRCameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  const [captureState, setCaptureState] = useState<CaptureState>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const capturePhoto = async () => {
    if (!camera.current) return;

    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      const imagePath = `file://${photo.path}`;

      // Show preview directly - no processing
      // Backend will handle rotation and cropping
      setPreviewImage(imagePath);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const confirmPhoto = () => {
    if (!previewImage) return;

    if (captureState === 'front') {
      setFrontImage(previewImage);
      setCaptureState('back');
      setPreviewImage(null);
    } else if (captureState === 'back') {
      setBackImage(previewImage);
      setCaptureState('complete');
      setPreviewImage(null);
    }
  };

  const retakePhoto = () => {
    setPreviewImage(null);
  };

  const navigateToLiveness = () => {
    if (frontImage && backImage) {
      (navigation as any).navigate('LivenessCamera', { frontImage, backImage });
    }
  };

  if (!hasPermission) {
    return <PermissionView onRequestPermission={requestPermission} />;
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader currentStep={1} />
        <View style={styles.center}>
          <Text style={styles.permissionText}>Không tìm thấy camera</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Preview mode - show captured image
  if (previewImage) {
    return (
      <PreviewView
        previewImage={previewImage}
        captureState={captureState === 'complete' ? 'back' : captureState}
        onConfirm={confirmPhoto}
        onRetake={retakePhoto}
      />
    );
  }

  // Complete mode - both images captured
  if (captureState === 'complete') {
    return (
      <CompleteView
        frontImage={frontImage!}
        backImage={backImage!}
        onContinue={navigateToLiveness}
        onRetake={() => {
          setCaptureState('front');
          setFrontImage(null);
          setBackImage(null);
        }}
      />
    );
  }

  // Camera mode
  return (
    <CameraView
      cameraRef={camera}
      device={device}
      captureState={captureState}
      onCapture={capturePhoto}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    padding: 20,
  },
});

export default OCRCameraScreen;
