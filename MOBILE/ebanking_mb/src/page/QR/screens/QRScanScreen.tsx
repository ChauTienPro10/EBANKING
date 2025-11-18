import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScannerFrame } from '../components';
import QRColors from '../styles/colors';
import TextStyles from '../../../constants/textStyle';

const QRScanScreen: React.FC = () => {
  const [flashOn, setFlashOn] = useState(false);

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.assets && result.assets[0]) {
        Alert.alert('Thành công', 'Đã chọn ảnh: ' + result.assets[0].fileName);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera Feed Simulation */}
      <View style={styles.cameraBackground} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Quét mã QR</Text>
          <Text style={styles.subtitle}>Đặt mã vào giữa khung để quét</Text>
        </View>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <ScannerFrame />
      </View>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => setFlashOn(!flashOn)}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, flashOn && styles.actionIconActive]}>
            <Icon
              name={flashOn ? 'zap' : 'zap-off'}
              size={24}
              color={QRColors.textWhite}
            />
          </View>
          <Text style={styles.actionLabel}>Đèn flash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <View style={styles.actionIcon}>
            <Icon name="image" size={24} color={QRColors.textWhite} />
          </View>
          <Text style={styles.actionLabel}>Thư viện</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f2937',
    opacity: 0.9,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    ...TextStyles.systemBold_18,
    color: QRColors.textWhite,
    letterSpacing: 0.3,
  },
  subtitle: {
    ...TextStyles.systemLight_12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  actions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: QRColors.flashInactive,
  },
  actionIconActive: {
    backgroundColor: QRColors.flashActive,
  },
  actionLabel: {
    ...TextStyles.systemLight_12,
    color: QRColors.textWhite,
  },
});

export default QRScanScreen;
