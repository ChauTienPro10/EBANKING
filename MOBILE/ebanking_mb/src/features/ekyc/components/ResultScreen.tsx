/**
 * Result Screen
 * Display eKYC verification results
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../../constants/color';

// Progress Header Component - Step 3 active
const ProgressHeader: React.FC = () => (
  <View style={styles.progressHeader}>
    <View style={styles.progressContainer}>
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>1</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={styles.progressStep}>
        <Text style={styles.stepText}>2</Text>
      </View>
      <View style={styles.progressLine} />
      <View style={[styles.progressStep, styles.activeStep]}>
        <Text style={styles.activeStepText}>3</Text>
      </View>
    </View>
    <View style={styles.progressLabels}>
      <Text style={styles.label}>Xác thực</Text>
      <Text style={styles.label}>Quay video</Text>
      <Text style={styles.activeLabel}>Kiểm tra</Text>
    </View>
  </View>
);

const ResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { success, ocrResult, livenessResult, faceMatchResult } =
    (route.params as any) || {};

  const handleClose = () => {
    // Navigate back to home or settings
    navigation.goBack();
    navigation.goBack();
    navigation.goBack();
    navigation.goBack();
  };

  if (!success) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
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

  // Extract OCR data with fallback to mock data
  const ocrData = ocrResult?.data || {
    id: '001234567890',
    name: 'NGUYỄN VĂN A',
    dob: '01/01/1990',
    gender: 'Nam',
    nationality: 'Việt Nam',
    address: 'Số 1, Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    issueDate: '01/01/2020',
    expiryDate: '01/01/2030',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader />
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
                  {faceMatchResult?.similarity || '96%'}
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
          style={styles.editButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
          <Text style={styles.buttonText}>Xác nhận</Text>
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
  // Progress Header
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  editButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  doneButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
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
});

export default ResultScreen;
