/**
 * OCR Camera Screen
 * Capture front and back of CMND/CCCD using react-native-vision-camera
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../constants/color';

type CaptureState = 'front' | 'back' | 'complete';

interface CardCorner {
  x: number;
  y: number;
  valid: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GUIDE_WIDTH = SCREEN_WIDTH * 0.85;
const GUIDE_HEIGHT = GUIDE_WIDTH / 1.586; // CCCD aspect ratio

// Progress Header Component - Consistent across all screens
const ProgressHeader: React.FC = () => (
  <View style={styles.progressHeader}>
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, styles.activeStep]}>
        <Text style={styles.activeStepText}>1</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>2</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>3</Text>
      </View>
    </View>
    <View style={styles.progressLabels}>
      <Text style={styles.activeLabel}>Xác thực</Text>
      <Text style={styles.label}>Quay video</Text>
      <Text style={styles.label}>Kiểm tra</Text>
    </View>
  </View>
);

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
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={styles.permissionText}>
            Cần quyền truy cập Camera để sử dụng tính năng eKYC
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Cấp quyền Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={styles.permissionText}>Không tìm thấy camera</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Preview mode - show captured image
  if (previewImage) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
        <Image source={{ uri: previewImage }} style={styles.preview} />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmPhoto}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
            <Text style={[styles.buttonText, { color: Colors.textSecondary }]}>
              Chụp lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Complete mode - both images captured
  if (captureState === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.completeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageGrid}>
            <View style={styles.imageCard}>
              <Text style={styles.imageLabel}>Mặt trước</Text>
              <Image source={{ uri: frontImage! }} style={styles.thumbnail} />
            </View>
            <View style={styles.imageCard}>
              <Text style={styles.imageLabel}>Mặt sau</Text>
              <Image source={{ uri: backImage! }} style={styles.thumbnail} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={navigateToLiveness}
          >
            <Text style={styles.primaryButtonText}>
              Tiếp tục xác thực khuôn mặt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setCaptureState('front');
              setFrontImage(null);
              setBackImage(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>Chụp lại</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Camera mode
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader />

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
          photoQualityBalance="balanced"
        />

        {/* Guide frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.guideBorder} />
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instructionSection}>
        <Text style={styles.instructionTitle}>
          Thẻ căn cước công dân{' '}
          <Text style={styles.instructionHighlight}>
            {captureState === 'front' ? 'Mặt trước' : 'Mặt sau'}
          </Text>
        </Text>
        <Text style={styles.instructionSubtitle}>
          Xin hãy giữ giấy tờ ở vùng chụp
        </Text>
      </View>

      {/* Capture Button */}
      <View style={styles.captureSection}>
        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Progress Indicator
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    elevation: 5,
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
  warningText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Camera Container
  cameraContainer: {
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
  guideBorder: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 12,
  },
  // Instruction section
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
  instructionHighlight: {
    color: '#FF9800',
    fontWeight: '700',
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  // Capture section
  captureSection: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.main_bule,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.main_bule,
  },
  // Old styles
  header: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.main_green,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: Colors.black,
  },
  previewControls: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.main_bule,
    borderRadius: 8,
    margin: 16,
  },
  retakeButton: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    marginBottom: 12,
  },
  confirmButton: {
    paddingVertical: 16,
    backgroundColor: Colors.main_bule,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: Colors.main_bule,
    borderRadius: 10,
    marginHorizontal: 24,
    marginVertical: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  completeContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  imageGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: 185,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OCRCameraScreen;
