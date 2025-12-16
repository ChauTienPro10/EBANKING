import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { Camera, CameraDevice, VideoFile } from 'react-native-vision-camera';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  // Animation for recording button pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Animation for countdown circle
  const countdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation during recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (countdown !== null) {
      // Scale animation for countdown circle
      countdownAnim.setValue(0);
      Animated.spring(countdownAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [countdown]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      {/* Camera - Full screen with cover mode */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        video={true}
        format={format}
        fps={30}
        videoStabilizationMode="auto"
        onInitialized={onCameraReady}
        onError={onCameraError}
        resizeMode="cover"
      />

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            {t('ekyc_flow.liveness.recording_message')}{' '}
            {Math.max(0, 5 - recordingTime).toFixed(1)}s
          </Text>
        </View>
      )}

      {/* UI Overlay */}
      <View style={styles.overlayContainer}>
        {/* Progress Header */}
        <View style={styles.headerContainer}>
          <ProgressHeader currentStep={2} />
        </View>

        {/* Face Guide */}
        <View style={styles.faceGuideContainer}>
          <View style={styles.faceGuide} />

          {/* Countdown - Centered in face guide */}
          {countdown !== null && (
            <View style={styles.countdownContainer}>
              <Animated.View
                style={[
                  styles.countdownCircle,
                  { transform: [{ scale: countdownAnim }] },
                ]}
              >
                <Text style={styles.countdownText}>{countdown}</Text>
              </Animated.View>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {/* Instruction */}
          <View style={styles.instructionSection}>
            <Text style={styles.instructionTitle}>
              {t('ekyc_flow.liveness.guidelines_title').replace(
                ' quay video',
                '',
              )}
            </Text>
            <Text style={styles.instructionSubtitle}>
              {t('ekyc_flow.liveness.guideline_1')}{' '}
              {t('ekyc_flow.liveness.guideline_3').toLowerCase()}
            </Text>
          </View>

          {/* Record/Stop Button - Elegant Design */}
          <View style={styles.captureSection}>
            {!isRecording && !countdown ? (
              // Start Recording Button
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  !isCameraReady && styles.recordButtonDisabled,
                ]}
                onPress={onStartRecording}
                disabled={!isCameraReady}
                activeOpacity={0.8}
              >
                <View style={styles.recordButtonOuter}>
                  <View style={styles.recordButtonInner} />
                </View>
              </TouchableOpacity>
            ) : (
              // Recording/Stop Button with Progress
              <View style={styles.recordingContainer}>
                {/* SVG Circular Progress */}
                {isRecording && (
                  <View style={styles.svgProgressContainer}>
                    <Svg width={80} height={80}>
                      {/* Progress Circle */}
                      <Circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#EF4444"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 36 * (1 - recordingTime / 5)
                        }`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="40, 40"
                      />
                    </Svg>
                  </View>
                )}

                {/* Stop Button */}
                <Animated.View
                  style={[
                    styles.stopButtonContainer,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={onStopRecording}
                    activeOpacity={0.8}
                  >
                    <View style={styles.stopButtonInner} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  headerContainer: {
    backgroundColor: Colors.white,
    zIndex: 10,
    elevation: 5,
  },
  faceGuideContainer: {
    flex: 1,
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
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  // Countdown - Simple & Minimal (in face guide)
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 56,
    fontWeight: '600',
    color: '#1F2937',
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
  bottomContainer: {
    backgroundColor: Colors.white,
  },
  instructionSection: {
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
    paddingVertical: 24,
    alignItems: 'center',
  },
  // Start Recording Button
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
  },
  // Recording State
  recordingContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgProgressContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  stopButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  stopButtonInner: {
    width: 24,
    height: 24,
    backgroundColor: '#6B7280',
    borderRadius: 3,
  },
});

export default CameraView;
