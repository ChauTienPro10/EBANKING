/**
 * Review Screen
 * Display OCR results and allow editing before submitting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../../constants/color';
import {
  processOCR,
  processLiveness,
  processFaceMatch,
} from '../services/ekycApi';

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

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { frontImage, backImage, videoPath } = (route.params as any) || {};

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('Đang xử lý ảnh CMND/CCCD...');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [skipAPI, setSkipAPI] = useState(false);

  useEffect(() => {
    // Auto-submit when screen loads
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (skipAPI) {
        // Skip API calls - use mock data for testing UI
        setStep('Đang xử lý (chế độ test)...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockData = {
          sessionId: 'test-session-' + Date.now(),
          success: true,
          ocrResult: { status: 'success', data: 'mock' },
          livenessResult: { status: 'success', score: 0.98 },
          faceMatchResult: { status: 'success', similarity: '96%' },
        };

        setLoading(false);
        (navigation as any).navigate('ResultScreen', mockData);
        return;
      }

      // Normal API flow
      // Step 0: Create session
      setStep('Đang khởi tạo phiên...');
      const { createEKYCSession } = await import('../services/ekycApi');
      const session = await createEKYCSession(1); // userId = 1 for now
      setSessionId(session.sessionId);
      console.log('✅ Session created:', session.sessionId);

      // Step 1: Process OCR
      setStep('Đang xử lý CMND/CCCD...');
      const ocrResult = await processOCR(
        session.sessionId,
        frontImage,
        backImage,
      );
      console.log('OCR Result:', ocrResult);

      // Step 2: Process Liveness
      setStep('Đang xác thực khuôn mặt...');
      const livenessResult = await processLiveness(
        session.sessionId,
        videoPath,
      );
      console.log('✅ Liveness Result:', livenessResult);

      // Step 3: Face Match
      setStep('Đang so sánh khuôn mặt...');
      const faceMatchResult = await processFaceMatch(session.sessionId);
      console.log('Face Match Result:', faceMatchResult);

      setLoading(false);

      // Navigate to result screen
      (navigation as any).navigate('ResultScreen', {
        sessionId: session.sessionId,
        success: true,
        ocrResult,
        livenessResult,
        faceMatchResult,
      });
    } catch (error: any) {
      console.error('❌ eKYC Error:', error);
      setLoading(false);

      // Parse error and provide user-friendly messages
      let title = 'Xác thực không thành công';
      let message = '';
      let retryButton = 'Thử lại';

      const errorMsg = error.message || '';
      const errorStr = JSON.stringify(error).toLowerCase();

      // OCR Errors
      if (
        errorMsg.includes('OCR') ||
        errorMsg.includes('card') ||
        errorMsg.includes('Unable to find ID card')
      ) {
        title = 'Không nhận diện được CCCD';
        message =
          'Không thể đọc thông tin từ ảnh CCCD của bạn.\n\nVui lòng:\n• Chụp ảnh rõ nét, không bị mờ\n• Đảm bảo đủ ánh sáng\n• CCCD nằm gọn trong khung\n• Không bị che khuất hoặc lóa sáng';
        retryButton = 'Chụp lại CCCD';
      }
      // Liveness Errors
      else if (
        errorMsg.includes('liveness') ||
        errorMsg.includes('spoof') ||
        errorMsg.includes('fake face') ||
        errorStr.includes('spoof')
      ) {
        title = 'Xác thực khuôn mặt không thành công';
        message =
          'Không thể xác thực khuôn mặt của bạn.\n\nVui lòng:\n• Sử dụng khuôn mặt thật (không dùng ảnh/video)\n• Quay ở nơi có đủ ánh sáng\n• Nhìn thẳng vào camera\n• Không đeo khẩu trang hoặc kính đen';
        retryButton = 'Quay lại video';
      }
      // Face Match Errors
      else if (
        errorMsg.includes('face match') ||
        errorMsg.includes('similarity') ||
        errorStr.includes('face')
      ) {
        title = 'Khuôn mặt không khớp';
        message =
          'Khuôn mặt trong video không khớp với ảnh trên CCCD.\n\nVui lòng:\n• Đảm bảo đúng người chụp CCCD\n• Quay video ở nơi sáng\n• Nhìn thẳng vào camera\n• Không che khuất khuôn mặt';
        retryButton = 'Thử lại';
      }
      // Quality/Image errors
      else if (
        errorMsg.includes('quality') ||
        errorMsg.includes('blur') ||
        errorMsg.includes('light')
      ) {
        title = 'Chất lượng ảnh/video chưa đạt';
        message =
          'Ảnh hoặc video của bạn chưa đủ chất lượng để xác thực.\n\nVui lòng:\n• Chụp/quay ở nơi có ánh sáng tốt\n• Giữ thiết bị thật vững\n• Đảm bảo camera sạch, không bị mờ\n• Tránh ngược sáng';
        retryButton = 'Thử lại';
      }
      // Network errors
      else if (
        errorMsg.includes('network') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('connection')
      ) {
        title = 'Lỗi kết nối';
        message =
          'Không thể kết nối đến máy chủ.\n\nVui lòng:\n• Kiểm tra kết nối internet\n• Thử lại sau vài phút';
        retryButton = 'Thử lại';
      }
      // Server errors (400, 500, etc)
      else if (errorMsg.includes('400') || errorMsg.includes('Bad Request')) {
        title = 'Dữ liệu không hợp lệ';
        message =
          'Dữ liệu gửi lên không đúng định dạng.\n\nVui lòng thử lại từ đầu.';
        retryButton = 'Chụp lại';
      } else if (
        errorMsg.includes('500') ||
        errorMsg.includes('Server Error')
      ) {
        title = 'Lỗi hệ thống';
        message =
          'Hệ thống đang gặp sự cố tạm thời.\n\nVui lòng thử lại sau ít phút.';
        retryButton = 'Thử lại';
      }
      // Generic error
      else {
        title = 'Xác thực không thành công';
        message =
          'Không thể hoàn tất xác thực danh tính.\n\nVui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu lỗi vẫn tiếp diễn.';
        retryButton = 'Thử lại';
      }

      Alert.alert(title, message, [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => (navigation as any).navigate('Settings'),
        },
        { text: retryButton, onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ProgressHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
          <Text style={styles.loadingText}>{step}</Text>
          <Text style={styles.loadingSubtext}>
            {skipAPI
              ? 'Chế độ test - không gọi API thực'
              : 'Vui lòng đợi trong giây lát...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader />

      {/* Skip API Toggle - For Testing Only */}
      <View style={styles.testModeContainer}>
        <TouchableOpacity
          style={styles.testModeToggle}
          onPress={() => setSkipAPI(!skipAPI)}
        >
          <View style={[styles.checkbox, skipAPI && styles.checkboxActive]}>
            {skipAPI && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.testModeTextContainer}>
            <Text style={styles.testModeLabel}>
              Chế độ test (không gọi API)
            </Text>
            <Text style={styles.testModeHint}>
              Dùng để test UI không tốn request
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Xác nhận thông tin</Text>

        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>CMND/CCCD</Text>
          <View style={styles.imageGrid}>
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Mặt trước</Text>
              <Image source={{ uri: frontImage }} style={styles.image} />
            </View>
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Mặt sau</Text>
              <Image source={{ uri: backImage }} style={styles.image} />
            </View>
          </View>
        </View>

        <View style={styles.videoCard}>
          <View style={styles.videoIconContainer}>
            <Text style={styles.videoIcon}>🎥</Text>
          </View>
          <View style={styles.videoContent}>
            <Text style={styles.videoTitle}>Video xác thực</Text>
            <Text style={styles.videoStatus}>
              Video đã được ghi lại thành công
            </Text>
          </View>
          <View style={styles.videoCheckmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Xác nhận</Text>
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
  // Test Mode Toggle
  testModeContainer: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  testModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D97706',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  testModeTextContainer: {
    flex: 1,
  },
  testModeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  testModeHint: {
    fontSize: 12,
    color: '#B45309',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    padding: 20,
    paddingBottom: 12,
  },
  imageSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Video Card
  videoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoIcon: {
    fontSize: 24,
  },
  videoContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  videoStatus: {
    fontSize: 13,
    color: '#6B7280',
  },
  videoCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
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
    flex: 1,
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
});

export default ReviewScreen;
