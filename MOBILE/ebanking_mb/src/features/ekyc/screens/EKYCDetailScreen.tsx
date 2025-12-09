import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootState } from '../../../store';
import { ekycApi } from '../../../services/ekycApi';
import { EkycDetailModel } from '../../../store/UserInfoModel';
import Colors from '../../../constants/color';
import Toast from 'react-native-toast-message';

const EKYCDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);

  const [loading, setLoading] = useState(true);
  const [ekycDetails, setEkycDetails] = useState<EkycDetailModel | null>(null);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    loadEkycDetails();
  }, []);

  const loadEkycDetails = async () => {
    try {
      if (!userInfo?.ekycSessionId) {
        Toast.show({
          type: 'error',
          text1: 'Không tìm thấy thông tin eKYC',
        });
        navigation.goBack();
        return;
      }

      const details = await ekycApi.getDetails(userInfo.ekycSessionId);
      setEkycDetails(details);
    } catch (error: any) {
      console.error('Failed to load eKYC details:', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể tải thông tin eKYC',
        text2: error?.message || 'Lỗi không xác định',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        setShowImages(true);
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Xác thực để xem ảnh CCCD',
      });

      if (success) {
        setShowImages(true);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Xác thực thất bại',
        });
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi xác thực',
      });
    }
  };

  const handleRetryEkyc = () => {
    Alert.alert(
      'Làm lại eKYC',
      'Bạn sẽ phải chụp lại CCCD và quay video xác thực. Tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          onPress: async () => {
            try {
              if (userInfo?.id) {
                await ekycApi.retryEkyc(userInfo.id);
                Toast.show({
                  type: 'success',
                  text1: 'Đã reset trạng thái eKYC',
                });
                navigation.navigate('EKYC' as never);
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Không thể làm lại eKYC',
              });
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    // Handle LocalDateTime array: [year, month, day, hour, minute, second, nano]
    if (Array.isArray(dateValue) && dateValue.length >= 6) {
      const [year, month, day, hour, minute] = dateValue;
      return `${String(day).padStart(2, '0')}-${String(month).padStart(
        2,
        '0',
      )}-${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
      )}`;
    }

    // Handle LocalDate array: [year, month, day]
    if (Array.isArray(dateValue) && dateValue.length === 3) {
      const [year, month, day] = dateValue;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(
        2,
        '0',
      )}/${year}`;
    }

    // Handle string dates (ISO format)
    if (typeof dateValue === 'string') {
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hour = String(date.getHours()).padStart(2, '0');
          const minute = String(date.getMinutes()).padStart(2, '0');
          return `${day}-${month}-${year} ${hour}:${minute}`;
        }
      } catch (e) {
        return dateValue;
      }
      return dateValue;
    }

    return 'N/A';
  };

  // Format date without time (for birth dates, issue dates, expiry dates)
  const formatDateOnly = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    // Handle array format (LocalDate or LocalDateTime - just take date part)
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const [year, month, day] = dateValue;
      return `${String(day).padStart(2, '0')}-${String(month).padStart(
        2,
        '0',
      )}-${year}`;
    }

    // Handle string dates
    if (typeof dateValue === 'string') {
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
      } catch (e) {
        return dateValue;
      }
      return dateValue;
    }

    return 'N/A';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.main_bule} />
      </View>
    );
  }

  if (!ekycDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin eKYC</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin định danh</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={Colors.success}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Đã xác thực</Text>
              <Text style={styles.statusDate}>
                {formatDate(ekycDetails.verifiedAt)}
              </Text>
            </View>
          </View>

          {/* Verification Scores */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Độ khớp khuôn mặt</Text>
              <Text style={styles.scoreValue}>
                {ekycDetails.faceMatchScore
                  ? `${ekycDetails.faceMatchScore.toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>

            {ekycDetails.livenessConfidence && (
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Độ tin cậy liveness</Text>
                <Text style={styles.scoreValue}>
                  {(ekycDetails.livenessConfidence * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          <InfoRow label="Họ và tên" value={ekycDetails.fullName} />
          <InfoRow label="Số CCCD" value={ekycDetails.idNumber} />
          <InfoRow
            label="Ngày sinh"
            value={formatDateOnly(ekycDetails.dateOfBirth)}
          />
          <InfoRow label="Giới tính" value={ekycDetails.gender} />
          <InfoRow label="Địa chỉ" value={ekycDetails.address} multiline />
        </View>

        {/* Document Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin giấy tờ</Text>
          <InfoRow
            label="Ngày cấp"
            value={formatDateOnly(ekycDetails.issueDate)}
          />
          <InfoRow
            label="Ngày hết hạn"
            value={formatDateOnly(ekycDetails.expiryDate)}
          />
        </View>

        {/* Images Section */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Hình ảnh xác thực</Text>

          {!showImages ? (
            <TouchableOpacity
              style={styles.viewImagesButton}
              onPress={handleViewImages}
            >
              <Ionicons name="eye" size={20} color={Colors.main_bule} />
              <Text style={styles.viewImagesButtonText}>
                Xem ảnh CCCD (yêu cầu xác thực)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagesContainer}>
              <View style={styles.imageRow}>
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Mặt trước</Text>
                  <Image
                    source={{ uri: ekycDetails.frontImageUrl }}
                    style={styles.idImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Mặt sau</Text>
                  <Image
                    source={{ uri: ekycDetails.backImageUrl }}
                    style={styles.idImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.noteText}>
            Thông tin này được lưu trữ bảo mật và chỉ dùng cho mục đích xác thực
            danh tính.
          </Text>
        </View>

        {/* Retry Button */}
        <TouchableOpacity style={styles.retryButton} onPress={handleRetryEkyc}>
          <Ionicons name="refresh" size={20} color={Colors.white} />
          <Text style={styles.retryButtonText}>Làm lại eKYC</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// InfoRow Component
const InfoRow: React.FC<{
  label: string;
  value: string;
  multiline?: boolean;
}> = ({ label, value, multiline = false }) => (
  <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: Colors.white,
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: Colors.grey3,
  },
  scoreContainer: {
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 8,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.grey3,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  infoValueMultiline: {
    textAlign: 'left',
    marginTop: 4,
  },
  viewImagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.infoLight,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  viewImagesButtonText: {
    fontSize: 15,
    color: Colors.main_bule,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagesContainer: {
    marginTop: 8,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  imageLabel: {
    fontSize: 13,
    color: Colors.grey3,
    marginBottom: 8,
    textAlign: 'center',
  },
  idImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: Colors.info,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EKYCDetailScreen;
