import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDE_WIDTH = SCREEN_WIDTH * 0.85;
const GUIDE_HEIGHT = GUIDE_WIDTH / 1.586; // CCCD aspect ratio

interface CameraViewProps {
  cameraRef: React.RefObject<Camera | null>;
  device: CameraDevice;
  captureState: 'front' | 'back';
  onCapture: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  cameraRef,
  device,
  captureState,
  onCapture,
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
          <ProgressHeader currentStep={1} />
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
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
          <TouchableOpacity style={styles.captureButton} onPress={onCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
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
  // Camera Container
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    overflow: 'hidden',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
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
});

export default CameraView;
