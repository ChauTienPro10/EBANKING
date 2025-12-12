/**
 * Face Authentication Screen
 * Wrapper around LivenessCameraScreen for transaction verification
 *
 * UX Flow (chuẩn ngân hàng VN):
 * 1. Show security notice with reason (HIGH_AMOUNT/DAILY_LIMIT)
 * 2. Show guidelines (reuse from eKYC)
 * 3. Record liveness video (reuse LivenessCameraScreen)
 * 4. Verify with backend
 * 5. Return sessionId to TransferScreen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Colors from '../../constants/color';
import { ShieldIcon } from '../../components/icon';
import { verifyTransactionFaceAuth } from '../../services/faceAuthApi';
// Use dedicated Face Auth camera component
import FaceLivenessCameraScreen from './FaceLivenessCameraScreen';
import GuidelinesView from '../ekyc/components/liveness-camera/GuidelinesView';
import FaceAuthResultModal from './FaceAuthResultModal';

type RouteParams = {
  FaceAuthScreen: {
    reason: 'HIGH_AMOUNT' | 'DAILY_LIMIT';
    amount: string;
    sessionId: string; // Session ID from check-face-auth
    limit: string; // User's limit that was exceeded
    onSuccess: (sessionId: string) => void;
  };
};
const FaceAuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FaceAuthScreen'>>();
  const { reason, amount, sessionId, limit, onSuccess } = route.params;
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const [step, setStep] = useState<
    'notice' | 'guidelines' | 'camera' | 'verifying'
  >('notice');
  const [isVerifying, setIsVerifying] = useState(false);

  // Modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verifiedSessionId, setVerifiedSessionId] = useState('');
  const getReasonMessage = () => {
    if (reason === 'HIGH_AMOUNT') {
      return {
        title: 'Giao Dịch Giá Trị Cao',
        subtitle: `Giao dịch ${amount} VND vượt hạn mức ${limit} VND`,
        description:
          'Để đảm bảo an toàn, vui lòng xác thực khuôn mặt trước khi tiếp tục.',
      };
    }
    return {
      title: 'Vượt Hạn Mức Ngày',
      subtitle: `Tổng giao dịch trong ngày vượt ${limit} VND`,
      description:
        'Để đảm bảo an toàn, vui lòng xác thực khuôn mặt trước khi tiếp tục.',
    };
  };
  const handleVideoRecorded = async (videoPath: string) => {
    if (!loginResponse?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    setStep('verifying');
    setIsVerifying(true);
    try {
      const result = await verifyTransactionFaceAuth(
        loginResponse.id,
        sessionId, // Use sessionId from route params
        videoPath,
      );
      if (result.verified) {
        setVerificationSuccess(true);
        setVerifiedSessionId(result.sessionId);
        setVerificationMessage('');
        setShowResultModal(true);
      } else {
        setVerificationSuccess(false);
        setVerificationMessage(
          'Quá trình xác thực thất bại. Vui lòng thử lại.',
        );
        setShowResultModal(true);
      }
    } catch (error: any) {
      setVerificationSuccess(false);
      setVerificationMessage('Quá trình xác thực thất bại. Vui lòng thử lại.');
      setShowResultModal(true);
    } finally {
      setIsVerifying(false);
    }
  };
  // Step 1: Security Notice (chuẩn UX ngân hàng VN)
  if (step === 'notice') {
    const { title, subtitle, description } = getReasonMessage();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noticeContent}>
          <View style={styles.iconContainer}>
            <ShieldIcon size={80} color={Colors.main_bule} />
          </View>
          <Text style={styles.noticeTitle}>{title}</Text>
          <Text style={styles.noticeSubtitle}>{subtitle}</Text>
          <Text style={styles.noticeDescription}>{description}</Text>
          <View style={styles.securityFeatures}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Bảo vệ tài khoản của bạn</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                Ngăn chặn giao dịch gian lận
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                Tuân thủ quy định an toàn ngân hàng
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep('guidelines')}
          >
            <Text style={styles.continueButtonText}>Tiếp Tục</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy Giao Dịch</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // Step 2: Guidelines (REUSE from eKYC)
  if (step === 'guidelines') {
    return <GuidelinesView onStart={() => setStep('camera')} />;
  }
  // Step 3: Camera Recording (Use FaceLivenessCameraScreen)
  if (step === 'camera') {
    return (
      <FaceLivenessCameraScreen
        onVideoRecorded={handleVideoRecorded}
        onBack={() => setStep('notice')}
      />
    );
  }
  // Step 4: Verifying
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.verifyingContent}>
        <ActivityIndicator size="large" color={Colors.main_bule} />
        <Text style={styles.verifyingText}>Đang xác thực khuôn mặt...</Text>
        <Text style={styles.verifyingSubtext}>Vui lòng đợi trong giây lát</Text>
      </View>

      {/* Result Modal */}
      <FaceAuthResultModal
        visible={showResultModal}
        success={verificationSuccess}
        message={verificationMessage}
        onContinue={() => {
          setShowResultModal(false);
          onSuccess(verifiedSessionId);
          navigation.goBack();
        }}
        onRetry={() => {
          setShowResultModal(false);
          setStep('notice');
        }}
        onCancel={() => {
          setShowResultModal(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  noticeContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  noticeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.main_bule,
    textAlign: 'center',
    marginBottom: 16,
  },
  noticeDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  securityFeatures: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.main_bule,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  continueButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verifyingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  verifyingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});
export default FaceAuthScreen;
