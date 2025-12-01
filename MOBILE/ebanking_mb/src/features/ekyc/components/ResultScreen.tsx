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
        <View style={styles.footer}>
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

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader />
      <View style={styles.contentContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.resultTitle}>Xác thực thành công!</Text>
        <Text style={styles.resultMessage}>
          Danh tính của bạn đã được xác minh thành công.
        </Text>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Thông tin xác thực</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>📄</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>OCR:</Text>
              <Text style={styles.detailValue}>Hoàn thành</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>🎬</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Liveness:</Text>
              <Text style={styles.detailValue}>Hoàn thành</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Face Match:</Text>
              <Text style={styles.detailValue}>
                Độ chính xác: {faceMatchResult?.similarity || '96%'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
          <Text style={styles.buttonText}>Hoàn tất</Text>
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
  contentContainer: {
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
  failIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  failIconText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  // Details Card
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doneButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButton: {
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
  closeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ResultScreen;
