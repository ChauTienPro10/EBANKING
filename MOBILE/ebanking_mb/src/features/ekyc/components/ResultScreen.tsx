/**
 * Result Screen
 * Display eKYC verification results
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../../../store/fetchAPI/UserInfoFetch';
import type { RootState } from '../../../store';
import Colors from '../../../constants/color';
import ProgressHeader from './shared/ProgressHeader';
import Toast from 'react-native-toast-message';

const ResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const { success, ocrResult, livenessResult, faceMatchResult, sessionId } =
    (route.params as any) || {};

  const [isCompleting, setIsCompleting] = useState(false);

  // Refresh user info after successful verification
  useEffect(() => {
    if (success && sessionId) {
      // Automatically complete the session after user views result
      completeEkycSession();
    }
  }, [success, sessionId]);

  const completeEkycSession = async () => {
    if (!sessionId) return;

    const userId = loginResponse?.id || 1;

    try {
      // Refresh user info to get the updated eKYC status
      await dispatch(fetchUserInfo(userId) as any);
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  };

  const handleClose = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      const userId = loginResponse?.id || 1;

      // Small delay to ensure backend has completed the update
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Refresh user info from backend
      try {
        await dispatch(fetchUserInfo(userId) as any);
      } catch (fetchError) {
        // Continue anyway - ProfileScreen will refresh when focused
      }

      // Small delay to ensure Redux store is updated
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

      navigation.navigate('Profile' as never);

      // Show success toast after navigation
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'eKYC thành công',
          text2: 'Thông tin từ CCCD đã được cập nhật vào hồ sơ của bạn',
          position: 'top',
          visibilityTime: 4000,
        });
      }, 500);
    } catch (error) {
      console.error('❌ Error during eKYC completion:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể hoàn tất xác thực',
      });
      // Navigate to Profile anyway
      navigation.navigate('Profile' as never);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!success) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader currentStep={3} />
        <View style={styles.contentContainer}>
          <View style={styles.failIcon}>
            <Text style={styles.failIconText}>×</Text>
          </View>
          <Text style={styles.resultTitle}>Xác thực thất bại</Text>
          <Text style={styles.resultMessage}>
            Không thể xác thực danh tính của bạn. Vui lòng thử lại.
          </Text>
        </View>
        <View style={[styles.footer, { paddingTop: 16 }]}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Helper function to format LocalDate array [year, month, day] to DD/MM/YYYY
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    // If it's an array [year, month, day] from Java LocalDate
    if (Array.isArray(dateValue) && dateValue.length === 3) {
      const [year, month, day] = dateValue;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(
        2,
        '0',
      )}/${year}`;
    }

    // If it's already a string, return as is
    if (typeof dateValue === 'string') return dateValue;

    return 'N/A';
  };

  // Extract OCR data from API response
  const ocrData = {
    id: ocrResult?.idNumber || 'N/A',
    name: ocrResult?.fullName || 'N/A',
    dob: formatDate(ocrResult?.dateOfBirth),
    gender: ocrResult?.gender || 'N/A',
    nationality: ocrResult?.nationality || 'Việt Nam',
    address: ocrResult?.address || 'N/A',
    issueDate: formatDate(ocrResult?.issueDate),
    expiryDate: formatDate(ocrResult?.expiryDate),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={3} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.resultTitle}>Xác thực thành công!</Text>
          <Text style={styles.resultMessage}>
            Vui lòng kiểm tra thông tin bên dưới
          </Text>

          {/* Personal Information Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{ocrData.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số CCCD</Text>
              <Text style={styles.infoValue}>{ocrData.id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>{ocrData.dob}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>{ocrData.gender}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quốc tịch</Text>
              <Text style={styles.infoValue}>{ocrData.nationality}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={styles.infoValueMultiline}>{ocrData.address}</Text>
            </View>
          </View>

          {/* Document Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin giấy tờ</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày cấp</Text>
              <Text style={styles.infoValue}>{ocrData.issueDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày hết hạn</Text>
              <Text style={styles.infoValue}>{ocrData.expiryDate}</Text>
            </View>
          </View>

          {/* Verification Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Độ khớp khuôn mặt</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusValue}>
                  {faceMatchResult?.similarity
                    ? `${faceMatchResult.similarity.toFixed(1)}%`
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.noteText}>
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isCompleting && styles.buttonDisabled]}
          onPress={handleClose}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.main_green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  failIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  failIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  // Information Cards
  infoCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.main_bule,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  infoValueMultiline: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
    lineHeight: 19,
  },
  // Status Card
  statusCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.main_green,
    shadowColor: Colors.main_green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Colors.main_green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.main_green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  noteText: {
    width: '100%',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 6,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginLeft: 6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ResultScreen;
