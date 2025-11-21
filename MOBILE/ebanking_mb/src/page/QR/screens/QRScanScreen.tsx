import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import type { Code } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ScannerFrame } from '../components';
import QRColors from '../styles/colors';
import TextStyles from '../../../constants/textStyle';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';

type QRNavigation = StackNavigationProp<RootStackParamList>;

type CameraPermissionState = 'loading' | 'granted' | 'denied';

const QRScanScreen: React.FC = () => {
  const navigation = useNavigation<QRNavigation>();
  const [flashOn, setFlashOn] = useState(false);
  const [permissionState, setPermissionState] =
    useState<CameraPermissionState>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const device = useCameraDevice('back');

  const normalizePermissionStatus = (status: string) => {
    return status === 'granted' || status === 'authorized' ? 'granted' : 'denied';
  };

  const loadInitialPermission = useCallback(async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      setPermissionState(normalizePermissionStatus(status));
    } catch (error) {
      setPermissionState('denied');
    }
  }, []);

  const requestCameraPermission = async () => {
    setPermissionState('loading');
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      if (!permission) {
        const status = await Camera.requestCameraPermission();
        setPermissionState(normalizePermissionStatus(status));
        return;
      }

      const status = await check(permission);
      if (status === RESULTS.GRANTED) {
        setPermissionState('granted');
        return;
      }

      // Ensure native permission prompt triggered by Vision Camera for Android 13+
      const nextStatus =
        status === RESULTS.BLOCKED
          ? await Camera.requestCameraPermission()
          : await request(permission);
      setPermissionState(
        nextStatus === RESULTS.GRANTED
          ? 'granted'
          : normalizePermissionStatus(String(nextStatus)),
      );
    } catch (error) {
      setPermissionState('denied');
    }
  };

  useEffect(() => {
    loadInitialPermission();
  }, [loadInitialPermission]);

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

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes: Code[]) => {
      if (!codes.length || isProcessing) {
        return;
      }

      const value = codes[0]?.value;
      if (!value) {
        return;
      }

      setIsProcessing(true);
      // Alert.alert('QR nhận được', value, [
      //   {
      //     text: 'Đóng',
      //     onPress: () => setIsProcessing(false),
      //   },
      // ]);
      const arr = value.split("|").map(item => item.trim());
      navigation.navigate('Transfer', { receiver: arr[0], amount: arr[1], content: arr[2], bankCode: '' });
      
    },
  });

  const renderCameraContent = () => {
    if (permissionState === 'loading') {
      return (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={QRColors.textWhite} />
          <Text style={styles.permissionText}>Đang kiểm tra quyền camera...</Text>
        </View>
      );
    }

    if (permissionState === 'denied') {
      return (
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={42} color={QRColors.textWhite} />
          <Text style={styles.permissionTitle}>Không truy cập được camera</Text>
          <Text style={styles.permissionText}>
            Vui lòng cấp quyền camera trong cài đặt để tiếp tục quét mã QR.
          </Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={QRColors.textWhite} />
          <Text style={styles.permissionText}>Đang khởi tạo camera...</Text>
        </View>
      );
    }

    return (
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={permissionState === 'granted'}
        codeScanner={codeScanner}
        torch={flashOn ? 'on' : 'off'}
        enableZoomGesture
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderCameraContent()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={22} color={QRColors.textWhite} />
        </TouchableOpacity>
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
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 48,
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
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    ...TextStyles.systemBold_18,
    color: QRColors.textWhite,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    ...TextStyles.systemLight_12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: QRColors.flashActive,
  },
  permissionButtonText: {
    ...TextStyles.systemMedium_14,
    color: QRColors.textWhite,
  },
});

export default QRScanScreen;
