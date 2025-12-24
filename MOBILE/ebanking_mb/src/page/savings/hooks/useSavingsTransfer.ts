import { useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState, AppDispatch, store } from '../../../store';
import { fetchAccountTransInfo } from '../../../store/fetchAPI/AccountFetch';
import { checkFaceAuthRequired } from '../../../services/faceAuthApi';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../../navigation/types';
import { useEkycValidation } from '../../../utils/useEkycValidation';
import { SavingsService } from '../../../services/SavingsService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface SavingsTransferData {
  amount: number;
  note?: string;
  accountNumber: string;
  type: 'TO_SAVINGS' | 'FROM_SAVINGS';
}

export const useSavingsTransfer = () => {
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const userInfo = useSelector(
    (state: RootState) => state.app.userInfoData,
  );
  const accountTransResponse = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  const dispatch: AppDispatch = store.dispatch;
  const { validateEkyc } = useEkycValidation();

  const [isLoading, setIsLoading] = useState(false);
  const [requiresFaceAuth, setRequiresFaceAuth] = useState(false);
  const [faceAuthSessionId, setFaceAuthSessionId] = useState<string | null>(null);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const handleSavingsTransfer = async (
    transferData: SavingsTransferData,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      Alert.alert('Lỗi', 'Thông tin tài khoản không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // Check eKYC for high-value transactions (> 10M VND)
      if (transferData.amount > 10000000) {
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
        transferData.amount.toString(),
      );

      if (faceAuthCheck.required) {
        setIsLoading(false);
        setRequiresFaceAuth(true);

        // Navigate to Face Auth Screen with sessionId
        (navigation as any).navigate('FaceAuthScreen', {
          reason: faceAuthCheck.reason,
          amount: transferData.amount.toString(),
          sessionId: faceAuthCheck.sessionId,
          limit: faceAuthCheck.limit,
          onSuccess: (sessionId: string) => {
            setFaceAuthSessionId(sessionId);
            // Continue with transfer after face auth success
            proceedWithSavingsTransfer(transferData, navigation);
          },
        });
        return;
      }

      // No face auth required, proceed normally
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);
      await proceedWithSavingsTransfer(transferData, navigation);
    } catch (error: any) {
      Alert.alert(
        'Lỗi giao dịch',
        error.message || 'Không thể thực hiện giao dịch',
      );
      setIsLoading(false);
    }
  };

  const proceedWithSavingsTransfer = async (
    transferData: SavingsTransferData,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      return;
    }

    try {
      const savingsTransferData = {
        fromAccount: transferData.type === 'TO_SAVINGS' 
          ? accountTransResponse.accountNumber 
          : transferData.accountNumber,
        toAccount: transferData.type === 'TO_SAVINGS' 
          ? transferData.accountNumber 
          : accountTransResponse.accountNumber,
        amount: transferData.amount,
        type: transferData.type,
        note: transferData.note,
      };

      if (transferData.type === 'TO_SAVINGS') {
        await SavingsService.transferToSavings(
          savingsTransferData, 
          userInfo.id, 
          loginResponse.username
        );
      } else {
        await SavingsService.transferFromSavings(
          savingsTransferData, 
          userInfo.id, 
          loginResponse.username
        );
      }

      // Refresh account info
      await dispatch(fetchAccountTransInfo(userInfo.id));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Giao dịch đã được thực hiện thành công',
      });

      // Reset face auth state
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);

      // Navigate back or to success screen
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error: any) {
      console.error('Error performing savings transfer:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thực hiện giao dịch',
      });
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
    handleSavingsTransfer,
    proceedWithSavingsTransfer,
  };
};