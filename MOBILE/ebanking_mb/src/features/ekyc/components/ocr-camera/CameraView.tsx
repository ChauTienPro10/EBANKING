import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GUIDE_WIDTH = SCREEN_WIDTH * 0.95; // Maximized to fill frame
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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      {/* Camera - Full screen with cover mode and zoom */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        photo={true}
        photoQualityBalance="balanced"
        resizeMode="cover"
        // zoom={1.8}
      />

      {/* UI Overlay */}
      <View style={styles.overlayContainer}>
        {/* Progress Header */}
        <View style={styles.headerContainer}>
          <ProgressHeader currentStep={1} />
        </View>

        {/* Camera Guide Frame */}
        <View style={styles.cameraGuideContainer}>
          <View style={styles.guideBorder} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {/* Instruction */}
          <View style={styles.instructionSection}>
            <Text style={styles.instructionTitle}>
              Thẻ căn cước công dân{' '}
              <Text style={styles.instructionHighlight}>
                {captureState === 'front' ? 'Mặt trước' : 'Mặt sau'}
              </Text>
            </Text>
            <Text style={styles.instructionSubtitle}>
              Đặt thẻ sát khung và giữ điện thoại gần
            </Text>
          </View>

          {/* Capture Button */}
          <View style={styles.captureSection}>
            <TouchableOpacity style={styles.captureButton} onPress={onCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
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
  cameraGuideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  guideBorder: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 12,
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
  instructionHighlight: {
    color: '#FF9800',
    fontWeight: '700',
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  captureSection: {
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
