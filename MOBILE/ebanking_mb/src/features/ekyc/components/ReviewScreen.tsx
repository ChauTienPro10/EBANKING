/**
 * Review Screen
 * Display OCR results and allow editing before submitting
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../../store';
import Colors from '../../../constants/color';
import {
  processOCR,
  processLiveness,
  processFaceMatch,
} from '../services/ekycApi';
import ProgressHeader from './shared/ProgressHeader';
import ImageSection from './review/ImageSection';
import VideoCard from './review/VideoCard';
import Footer from './review/Footer';

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { frontImage, backImage, videoPath } = (route.params as any) || {};
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(t('ekyc_flow.review.step_ocr'));
  const [sessionId, setSessionId] = useState<string | null>(null);

  const showCitizenIdMismatchDialog = (
    currentId: string,
    ocrId: string,
  ): Promise<boolean> => {
    return new Promise(resolve => {
      Alert.alert(
        t('ekyc_flow.validation.citizenid_mismatch_title'),
        t('ekyc_flow.validation.citizenid_mismatch_message', {
          currentId,
          ocrId,
        }),
        [
          {
            text: t('ekyc_flow.validation.citizenid_mismatch_cancel'),
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: t('ekyc_flow.validation.citizenid_mismatch_confirm'),
            onPress: () => resolve(true),
          },
        ],
      );
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Step 0: Create session (userId extracted from JWT by backend)
      setStep(t('ekyc_flow.review.step_init'));
      const { createEKYCSession } = await import('../services/ekycApi');
      const session = await createEKYCSession(); // No userId - extracted from JWT
      setSessionId(session.sessionId);

      // Step 1: Process OCR
      setStep(t('ekyc_flow.review.step_ocr'));
      const ocrResult = await processOCR(
        session.sessionId,
        frontImage,
        backImage,
      );

      // ✅ NEW: Validate citizenId
      const currentCitizenId = userInfo?.citizenId;
      const ocrCitizenId = ocrResult?.idNumber;

      if (
        currentCitizenId &&
        ocrCitizenId &&
        currentCitizenId !== ocrCitizenId
      ) {
        // Show confirmation dialog
        const confirmed = await showCitizenIdMismatchDialog(
          currentCitizenId,
          ocrCitizenId,
        );

        if (!confirmed) {
          // User cancelled - go back to capture
          setLoading(false);
          navigation.goBack();
          return;
        }
      }

      // Step 2: Process Liveness
      setStep(t('ekyc_flow.review.step_liveness'));
      const livenessResult = await processLiveness(
        session.sessionId,
        videoPath,
      );

      // Step 3: Face Match
      setStep(t('ekyc_flow.review.step_face_match'));
      const faceMatchResult = await processFaceMatch(session.sessionId);

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
      setLoading(false);

      // ✅ NEW: Handle duplicate citizenId error from backend
      if (
        error.message?.includes('đã được sử dụng') ||
        error.message?.includes('duplicate') ||
        error.message?.includes('already exists') ||
        error.status === 409
      ) {
        Alert.alert(
          t('ekyc_flow.validation.citizenid_duplicate_title'),
          t('ekyc_flow.validation.citizenid_duplicate_message'),
          [
            {
              text: t('ekyc_flow.validation.citizenid_duplicate_close'),
              style: 'cancel',
            },
            {
              text: t('ekyc_flow.validation.citizenid_duplicate_support'),
              onPress: () => navigation.navigate('Support' as never),
            },
          ],
        );
        return;
      }

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
        <ProgressHeader currentStep={3} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
          <Text style={styles.loadingText}>{step}</Text>
          <Text style={styles.loadingSubtext}>
            {t('ekyc_flow.review.loading_subtitle')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={3} />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{t('ekyc_flow.review.title')}</Text>

        <ImageSection frontImage={frontImage} backImage={backImage} />

        <VideoCard />
      </ScrollView>

      <Footer onBack={() => navigation.goBack()} onConfirm={handleSubmit} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
});

export default ReviewScreen;
