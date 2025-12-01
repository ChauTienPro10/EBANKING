import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { Camera, CameraDevice, VideoFile } from 'react-native-vision-camera';
import Svg, { Circle } from 'react-native-svg';
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
            <View style={styles.recordingButtonWrapper}>
              {/* Circular Progress using SVG */}
              <Svg width="84" height="84" style={styles.progressSvg}>
                {/* Background Circle */}
                <Circle
                  cx="42"
                  cy="42"
                  r="38"
                  stroke="#E5E7EB"
                  strokeWidth="5"
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx="42"
                  cy="42"
                  r="38"
                  stroke={Colors.main_green}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 38 * (1 - recordingTime / 5)
                  }`}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="42, 42"
                />
              </Svg>

              {/* Stop Button with Timer */}
              <TouchableOpacity
                style={styles.stopButtonContainer}
                onPress={onStopRecording}
                activeOpacity={0.8}
              >
                <View style={styles.stopButtonInner} />
                <Text style={styles.timerText}>
                  {Math.max(0, 5 - recordingTime).toFixed(1)}s
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
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
    overflow: 'hidden',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
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
  recordingButtonWrapper: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
  },
  stopButtonContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButtonInner: {
    width: 24,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
});

export default CameraView;
