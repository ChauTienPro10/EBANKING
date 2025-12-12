import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState, AppDispatch, store } from '../../../store';
import { fetchAccountTransInfo } from '../../../store/fetchAPI/AccountFetch';
import { checkFaceAuthRequired } from '../../../services/faceAuthApi';
import fetch from '../../../utils/fetch';
import { API } from '../../../constants/api';
import Toast from 'react-native-toast-message';
import { TransferFormData } from '../types/transfer.types';
import { RootStackParamList } from '../../../navigation/types';
import { sanitizeTransferContent } from '../utils/transfer.utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transfer'>;

export const useTransferSubmit = () => {
  const { t } = useTranslation();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  // Use userInfoData for accurate eKYC status (updated after eKYC completion)
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const dispatch: AppDispatch = store.dispatch;

  const [isLoading, setIsLoading] = useState(false);
  const [requiresFaceAuth, setRequiresFaceAuth] = useState(false);
  const [faceAuthSessionId, setFaceAuthSessionId] = useState<string | null>(
    null,
  );
  const [receiverName, setReceiverName] = useState('');
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const proceedWithAccountCheck = async (formData: TransferFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch.post(API.CHECK_ACCOUNT_NUMBER, {
        accountNumber: formData.recipientAccount,
      });
      if (response?.isExist) {
        setReceiverName(response?.fullName);
        setTransferModalVisible(true);
        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Giao dịch thất bại',
          text2: 'Tài khoản không tồn tại!',
        });
        return false;
      }
    } catch (error) {
      Alert.alert(t('transfer.error.title'), t('transfer.error.message'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (
    formData: TransferFormData,
    navigation: NavigationProp,
    validateForm: () => boolean,
  ) => {
    if (!validateForm()) {
      return;
    }

    if (formData.transferType === 'external' && !formData.selectedBank) {
      Alert.alert(
        t('transfer.error.title'),
        t('transfer.validation.bank_required'),
      );
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Check if face authentication is required
      const faceAuthCheck = await checkFaceAuthRequired(
        loginResponse?.id!,
        loginResponse?.username!,
        formData.amount,
      );

      if (faceAuthCheck.required) {
        // Check eKYC status before allowing face auth
        const amountNum = parseFloat(formData.amount.replace(/,/g, ''));
        if (amountNum > 10000000) {
          // Check if user has completed eKYC - use userInfo for most up-to-date status
          const ekycStatus = userInfo?.ekycStatus;

          if (!ekycStatus || ekycStatus !== 'VERIFIED') {
            setIsLoading(false);
            setShowEKYCModal(true);
            return;
          }
        }

        setIsLoading(false);
        setRequiresFaceAuth(true);

        // Navigate to Face Auth Screen with sessionId
        (navigation as any).navigate('FaceAuthScreen', {
          reason: faceAuthCheck.reason,
          amount: formData.amount,
          sessionId: faceAuthCheck.sessionId,
          onSuccess: (sessionId: string) => {
            setFaceAuthSessionId(sessionId);
            // Continue with account check after face auth success
            proceedWithAccountCheck(formData);
          },
        });
        return;
      }

      // No face auth required, proceed normally
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);
      await proceedWithAccountCheck(formData);
    } catch (error: any) {
      Alert.alert(
        t('transfer.error.title'),
        error.message || t('transfer.error.message'),
      );
      setIsLoading(false);
    }
  };

  const handleConfirmTransfer = async (
    pin: string,
    formData: TransferFormData,
    navigation: NavigationProp,
    shouldSaveRecipient: boolean,
    saveRecipientCallback?: (
      accountNumber: string,
      accountName: string,
    ) => void,
  ) => {
    try {
      // Sanitize content before sending to API
      const sanitizedContent = sanitizeTransferContent(formData.content);

      const payload = {
        pin: pin,
        username: loginResponse?.username,
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: formData.recipientAccount,
        amount: formData.amount.replace(/,/g, ''),
        currency: 'VND',
        transactionType: 'TRANSFER',
        description: sanitizedContent, // Use sanitized content
        requiresFaceAuth: requiresFaceAuth,
        faceAuthSessionId: faceAuthSessionId,
      };

      const transferResponse = await fetch.post(API.TRANSFER, payload);

      if (transferResponse?.transactionId) {
        if (loginResponse?.id !== undefined) {
          dispatch(fetchAccountTransInfo(loginResponse.id));
        }

        // Lưu số tài khoản người nhận nếu checkbox được chọn
        if (
          shouldSaveRecipient &&
          formData.recipientAccount &&
          saveRecipientCallback
        ) {
          await saveRecipientCallback(formData.recipientAccount, receiverName);
        }

        // Reset face auth state
        setRequiresFaceAuth(false);
        setFaceAuthSessionId(null);

        navigation.navigate('PendingTransactionScreen', {
          amount: '₫' + formData.amount,
          content: sanitizedContent, // Use sanitized content
          date: new Date().toISOString(),
          receiverName: receiverName,
          transactionId: transferResponse.transactionId, // Real transaction ID from API
        });
      } else {
        navigation.navigate('TransactionFailedScreen');
      }
    } catch (error: any) {
      const extractedMessage = error.toString().split(':')[2] || error;
      navigation.navigate('TransactionFailedScreen', {
        errorString: extractedMessage,
      });
    } finally {
      setTransferModalVisible(false);
      setIsLoading(false);
    }
  };

  const handleCancelTransfer = () => {
    setTransferModalVisible(false);
  };

  return {
    isLoading,
    requiresFaceAuth,
    faceAuthSessionId,
    receiverName,
    transferModalVisible,
    showEKYCModal,
    setShowEKYCModal,
    handleTransfer,
    handleConfirmTransfer,
    handleCancelTransfer,
    proceedWithAccountCheck,
  };
};
