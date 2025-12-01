/**
 * Liveness Camera Screen
 * Record video for liveness detection using react-native-vision-camera
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../../constants/color';

// Progress Header Component - Consistent with OCR screen
const ProgressHeader: React.FC = () => (
  <View style={styles.progressHeader}>
    <View style={styles.progressContainer}>
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>1</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={[styles.progressStep, styles.activeStep]}>
        <Text style={styles.activeStepText}>2</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>3</Text>
      </View>
    </View>
    <View style={styles.progressLabels}>
      <Text style={styles.label}>Xác thực</Text>
      <Text style={styles.activeLabel}>Quay video</Text>
      <Text style={styles.label}>Kiểm tra</Text>
    </View>
  </View>
);

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
      await new Promise(resolve => setTimeout(resolve, 3000));

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
          console.log('✅ Video recorded:', video.path);
          console.log('📊 Video duration:', video.duration, 'seconds');
          setVideoPath(`file://${video.path}`);
          setIsRecording(false);
          setRecordingTime(0);
        },
        onRecordingError: error => {
          clearInterval(recordingInterval);
          console.error('❌ Recording error:', error);
          Alert.alert('Lỗi', 'Không thể quay video. Vui lòng thử lại.');
          setIsRecording(false);
          setRecordingTime(0);
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
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
        <ProgressHeader />
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
        <ProgressHeader />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Không tìm thấy camera trước</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Video completed - show controls
  if (videoPath) {
    return (
      <SafeAreaView style={styles.whiteContainer}>
        <ProgressHeader />
        <View style={styles.completeContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.completeTitle}>Đã quay xong video</Text>
          <Text style={styles.completeSubtitle}>
            Video đã được ghi lại thành công
          </Text>
        </View>
        <View style={styles.completeControls}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={navigateToReview}
          >
            <Text style={styles.primaryButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={retake}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show guidelines modal before starting
  if (showGuidelines) {
    return (
      <SafeAreaView style={styles.whiteContainer}>
        <ProgressHeader />
        <View style={styles.guidelinesContainer}>
          <Text style={styles.guidelinesTitle}>Hướng dẫn quay video</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>
                Di chuyển đến nơi có ánh sáng tốt
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>
                Đảm bảo không bị ngược sáng
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>
                Giữ khuôn mặt trong khung hình
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>Nhìn thẳng vào camera</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>
                Không lay động trong 5 giây
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowGuidelines(false)}
          >
            <Text style={styles.startButtonText}>Bắt đầu quay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.whiteContainer}>
      <ProgressHeader />

      <View style={styles.cameraWrapper}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={true}
          video={true}
          format={format}
          fps={30}
          videoStabilizationMode="auto"
          onInitialized={() => {
            console.log('✅ Camera initialized and ready');
            setIsCameraReady(true);
          }}
          onError={error => {
            console.error('❌ Camera error:', error);
            Alert.alert(
              'Lỗi Camera',
              'Không thể khởi tạo camera. Vui lòng thử lại.',
            );
          }}
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
              Đang quay... {(5 - recordingTime).toFixed(1)}s
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
            onPress={startRecording}
            disabled={!isCameraReady}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // Progress Header
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: Colors.main_green,
  },
  progressLine: {
    width: 80,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  activeStepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  activeLabel: {
    fontSize: 12,
    color: Colors.main_bule,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  // Camera View
  cameraWrapper: {
    flex: 1,
    backgroundColor: Colors.black,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 150,
    backgroundColor: 'transparent',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '700',
    color: Colors.white,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  recordingText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // Instruction Section
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
  // Capture Section
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
    borderColor: '#D1D5DB',
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
    borderColor: '#EF4444',
  },
  stopButtonInner: {
    width: 28,
    height: 28,
    backgroundColor: '#EF4444',
  },
  // Permission Screen
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
  // Complete Screen
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  completeControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Guidelines Screen
  guidelinesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  guidelinesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  guidelinesList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.main_bule,
    marginRight: 12,
  },
  guidelineText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LivenessCameraScreen;
