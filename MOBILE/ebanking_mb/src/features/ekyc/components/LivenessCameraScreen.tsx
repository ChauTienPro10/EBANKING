/**
 * Liveness Camera Screen
 * Record video for liveness detection using react-native-vision-camera
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../../constants/color';
import ProgressHeader from './shared/ProgressHeader';
import GuidelinesView from './liveness-camera/GuidelinesView';
import CompleteView from './liveness-camera/CompleteView';
import CameraView from './liveness-camera/CameraView';

const LivenessCameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { frontImage, backImage } = (route.params as any) || {};

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);

  // Get format that supports video recording at 30fps
  const format = device?.formats.find(
    f => f.videoWidth >= 1280 && f.videoHeight >= 720 && f.maxFps >= 30,
  );

  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startRecording = async () => {
    if (!camera.current || isRecording || !isCameraReady) {
      if (!isCameraReady) {
        Alert.alert('Thông báo', 'Camera đang khởi tạo, vui lòng đợi...');
      }
      return;
    }

    try {
      // Countdown before recording
      setCountdown(3);
      const countInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countInterval);
            return null;
          }
          return prev! - 1;
        });
      }, 1000);

      // Wait for countdown
      await new Promise<void>(resolve => setTimeout(resolve, 3000));

      // Start recording with high quality settings
      setIsRecording(true);
      setRecordingTime(0);

      // Recording timer for UI
      const recordingInterval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1;
          // Auto complete when reaching 5 seconds
          if (newTime >= 5.0) {
            clearInterval(recordingInterval);
            if (camera.current) {
              camera.current.stopRecording();
            }
          }
          return newTime;
        });
      }, 100);

      await camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: video => {
          clearInterval(recordingInterval);
          setVideoPath(`file://${video.path}`);
          setIsRecording(false);
          setRecordingTime(0);
        },
        onRecordingError: error => {
          clearInterval(recordingInterval);
          Alert.alert('Lỗi', 'Không thể quay video. Vui lòng thử lại.');
          setIsRecording(false);
          setRecordingTime(0);
        },
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể bắt đầu quay. Vui lòng thử lại.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!camera.current || !isRecording) return;
    await camera.current.stopRecording();
  };

  const navigateToReview = () => {
    if (videoPath && frontImage && backImage) {
      (navigation as any).navigate('ReviewScreen', {
        frontImage,
        backImage,
        videoPath,
      });
    }
  };

  const retake = () => {
    setVideoPath(null);
    setIsRecording(false);
    setCountdown(null);
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.whiteContainer}>
        <ProgressHeader currentStep={2} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Cần quyền truy cập Camera để quay video xác thực
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.whiteContainer}>
        <ProgressHeader currentStep={2} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Không tìm thấy camera trước</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Video completed - show controls
  if (videoPath) {
    return <CompleteView onContinue={navigateToReview} onRetake={retake} />;
  }

  // Show guidelines modal before starting
  if (showGuidelines) {
    return <GuidelinesView onStart={() => setShowGuidelines(false)} />;
  }

  return (
    <CameraView
      cameraRef={camera}
      device={device}
      format={format}
      isCameraReady={isCameraReady}
      isRecording={isRecording}
      countdown={countdown}
      recordingTime={recordingTime}
      onCameraReady={() => setIsCameraReady(true)}
      onCameraError={() => {
        Alert.alert(
          'Lỗi Camera',
          'Không thể khởi tạo camera. Vui lòng thử lại.',
        );
      }}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
    />
  );
};

const styles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default LivenessCameraScreen;
