import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Camera, CameraDevice, VideoFile } from 'react-native-vision-camera';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface CameraViewProps {
  cameraRef: React.RefObject<Camera | null>;
  device: CameraDevice;
  format: any;
  isCameraReady: boolean;
  isRecording: boolean;
  countdown: number | null;
  recordingTime: number;
  onCameraReady: () => void;
  onCameraError: (error: any) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  cameraRef,
  device,
  format,
  isCameraReady,
  isRecording,
  countdown,
  recordingTime,
  onCameraReady,
  onCameraError,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={false}
      />
      <View style={styles.container}>
        {/* Progress Header - Always visible */}
        <View style={styles.headerContainer}>
          <ProgressHeader currentStep={2} />
        </View>

        <View style={styles.cameraWrapper}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={true}
            video={true}
            format={format}
            fps={30}
            videoStabilizationMode="auto"
            onInitialized={onCameraReady}
            onError={onCameraError}
          />

          {countdown !== null && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Đang quay... {Math.max(0, 5 - recordingTime).toFixed(1)}s
              </Text>
            </View>
          )}

          <View style={styles.overlay}>
            <View style={styles.faceGuide} />
          </View>
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instructionTitle}>Xác thực khuôn mặt</Text>
          <Text style={styles.instructionSubtitle}>
            Giữ khuôn mặt trong khung oval và nhìn thẳng vào camera
          </Text>
        </View>

        <View style={styles.captureSection}>
          {!isRecording && !countdown ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                !isCameraReady && styles.recordButtonDisabled,
              ]}
              onPress={onStartRecording}
              disabled={!isCameraReady}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={onStopRecording}
            >
              <View style={styles.stopButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    zIndex: 10,
    elevation: 5, // Android shadow
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: Colors.black,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: '700',
    color: Colors.white,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 240,
    height: 300,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 150,
    opacity: 0.8,
  },
  instructionSection: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  captureSection: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6B7280',
  },
  stopButtonInner: {
    width: 32,
    height: 32,
    backgroundColor: '#6B7280',
    borderRadius: 4,
  },
});

export default CameraView;
