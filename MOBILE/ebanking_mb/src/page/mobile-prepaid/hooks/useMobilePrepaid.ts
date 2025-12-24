import { useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState } from '../../../store';
import { checkFaceAuthRequired } from '../../../services/faceAuthApi';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../../navigation/types';
import { useEkycValidation } from '../../../utils/useEkycValidation';
import MobilePrepaidService, { PrepaidRequest } from '../../../services/MobilePrepaidService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useMobilePrepaid = () => {
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const userInfo = useSelector(
    (state: RootState) => state.app.userInfoData,
  );
  const accountTransResponse = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  const { validateEkyc } = useEkycValidation();

  const [isLoading, setIsLoading] = useState(false);
  const [requiresFaceAuth, setRequiresFaceAuth] = useState(false);
  const [faceAuthSessionId, setFaceAuthSessionId] = useState<string | null>(null);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const handleMobilePrepaid = async (
    request: Omit<PrepaidRequest, 'userId' | 'username' | 'accountNumber'>,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      Alert.alert('Lỗi', 'Thông tin tài khoản không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // Check eKYC for high-value transactions (> 200K VND)
      if (request.amount > 200000) {
        const ekycValidation = validateEkyc(
          (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
            setIsLoading(false);
            setShowEKYCModal(true);
          },
        );

        if (!ekycValidation.isValid) {
          setIsLoading(false);
          setShowEKYCModal(true);
          return;
        }
      }

      // Check if face authentication is required
      const faceAuthCheck = await checkFaceAuthRequired(
        userInfo.id,
        loginResponse.username,
        request.amount.toString(),
      );

      if (faceAuthCheck.required) {
        setIsLoading(false);
        setRequiresFaceAuth(true);

        // Navigate to Face Auth Screen with sessionId
        (navigation as any).navigate('FaceAuthScreen', {
          reason: faceAuthCheck.reason,
          amount: request.amount.toString(),
          sessionId: faceAuthCheck.sessionId,
          limit: faceAuthCheck.limit,
          onSuccess: (sessionId: string) => {
            setFaceAuthSessionId(sessionId);
            // Continue with mobile prepaid after face auth success
            proceedWithMobilePrepaid({
              ...request,
              requiresFaceAuth: true,
              faceAuthSessionId: sessionId,
            }, navigation);
          },
        });
        return;
      }

      // No face auth required, proceed normally
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);
      await proceedWithMobilePrepaid({
        ...request,
        requiresFaceAuth: false,
      }, navigation);
    } catch (error: any) {
      Alert.alert(
        'Lỗi giao dịch',
        error.message || 'Không thể thực hiện giao dịch',
      );
      setIsLoading(false);
    }
  };

  const proceedWithMobilePrepaid = async (
    request: Omit<PrepaidRequest, 'userId' | 'username' | 'accountNumber'>,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      return;
    }

    try {
      const fullRequest: PrepaidRequest = {
        ...request,
        userId: userInfo.id,
        username: loginResponse.username,
        accountNumber: accountTransResponse.accountNumber,
      };

      const transaction = await MobilePrepaidService.topUpMobile(fullRequest);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Giao dịch nạp tiền đã được thực hiện',
      });

      // Reset face auth state
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);

      // Navigate to result screen
      (navigation as any).navigate('MobilePrepaidResult', {
        transaction,
        operator: { /* operator info */ },
        amount: request.amount,
      });

    } catch (error: any) {
      console.error('Error performing mobile prepaid:', error);
      
      // Handle specific error cases
      if (error.message?.includes('ACCOUNT_LOCKED')) {
        Alert.alert(
          'Tài khoản bị khóa',
          'Tài khoản của bạn đã bị khóa và không thể thực hiện giao dịch. Vui lòng liên hệ hỗ trợ.',
        );
      } else {
        Alert.alert(
          'Lỗi giao dịch',
          error.message || 'Không thể thực hiện giao dịch nạp tiền',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyFaceAuth = async (faceAuthSessionId: string) => {
    try {
      setIsLoading(true);
      const transaction = await MobilePrepaidService.verifyFaceAuth(faceAuthSessionId);
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Xác thực khuôn mặt thành công',
      });

      return transaction;
    } catch (error: any) {
      console.error('Error verifying face auth:', error);
      Alert.alert(
        'Lỗi xác thực',
        error.message || 'Không thể xác thực khuôn mặt',
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    requiresFaceAuth,
    faceAuthSessionId,
    showEKYCModal,
    setShowEKYCModal,
    handleMobilePrepaid,
    proceedWithMobilePrepaid,
    handleVerifyFaceAuth,
  };
};