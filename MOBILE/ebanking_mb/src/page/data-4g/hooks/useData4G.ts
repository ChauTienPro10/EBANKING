import { useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState } from '../../../store';
import { checkFaceAuthRequired } from '../../../services/faceAuthApi';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../../navigation/types';
import { useEkycValidation } from '../../../utils/useEkycValidation';
import Data4GService, { DataTopUpRequest } from '../../../services/Data4GService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useData4G = () => {
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

  const handleData4GTopUp = async (
    request: Omit<DataTopUpRequest, 'userId' | 'username' | 'accountNumber'>,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      Alert.alert('Lỗi', 'Thông tin tài khoản không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // Get package info to determine price for eKYC validation
      const packageInfo = await Data4GService.getDataPackageById(request.packageId);
      
      // Check eKYC for high-value transactions (> 100K VND for data packages)
      if (packageInfo.price > 100000) {
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
        packageInfo.price.toString(),
      );

      if (faceAuthCheck.required) {
        setIsLoading(false);
        setRequiresFaceAuth(true);

        // Navigate to Face Auth Screen with sessionId
        (navigation as any).navigate('FaceAuthScreen', {
          reason: faceAuthCheck.reason,
          amount: packageInfo.price.toString(),
          sessionId: faceAuthCheck.sessionId,
          limit: faceAuthCheck.limit,
          onSuccess: (sessionId: string) => {
            setFaceAuthSessionId(sessionId);
            // Continue with data top-up after face auth success
            proceedWithData4GTopUp({
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
      await proceedWithData4GTopUp({
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

  const proceedWithData4GTopUp = async (
    request: Omit<DataTopUpRequest, 'userId' | 'username' | 'accountNumber'>,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username || !accountTransResponse?.accountNumber) {
      return;
    }

    try {
      const fullRequest: DataTopUpRequest = {
        ...request,
        userId: userInfo.id,
        username: loginResponse.username,
        accountNumber: accountTransResponse.accountNumber,
      };

      const transaction = await Data4GService.initiateDataTopUp(fullRequest);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Giao dịch nạp data đã được thực hiện',
      });

      // Reset face auth state
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);

      // Navigate to result screen
      (navigation as any).navigate('Data4GResult', {
        transaction,
        provider: request.phoneNumber ? Data4GService.detectProviderFromPhoneNumber(request.phoneNumber) : 'UNKNOWN',
        package: await Data4GService.getDataPackageById(request.packageId),
      });

    } catch (error: any) {
      console.error('Error performing data 4G top-up:', error);
      
      // Handle specific error cases
      if (error.message?.includes('ACCOUNT_LOCKED')) {
        Alert.alert(
          'Tài khoản bị khóa',
          'Tài khoản của bạn đã bị khóa và không thể thực hiện giao dịch. Vui lòng liên hệ hỗ trợ.',
        );
      } else if (error.message?.includes('PACKAGE_NOT_FOUND')) {
        Alert.alert(
          'Lỗi gói data',
          'Gói data không tồn tại hoặc đã ngừng cung cấp. Vui lòng chọn gói khác.',
        );
      } else if (error.message?.includes('PROVIDER_MISMATCH')) {
        Alert.alert(
          'Lỗi nhà mạng',
          'Số điện thoại không khớp với nhà mạng đã chọn. Vui lòng kiểm tra lại.',
        );
      } else if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        Alert.alert(
          'Số dư không đủ',
          'Số dư tài khoản không đủ để thực hiện giao dịch. Vui lòng nạp thêm tiền.',
        );
      } else {
        Alert.alert(
          'Lỗi giao dịch',
          error.message || 'Không thể thực hiện giao dịch nạp data',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyFaceAuth = async (transactionId: string, faceAuthSessionId: string) => {
    try {
      setIsLoading(true);
      const transaction = await Data4GService.verifyFaceAuthAndProcess({
        transactionId,
        faceAuthSessionId,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Xác thực khuôn mặt thành công',
      });

      return transaction;
    } catch (error: any) {
      console.error('Error verifying face auth for data top-up:', error);
      Alert.alert(
        'Lỗi xác thực',
        error.message || 'Không thể xác thực khuôn mặt',
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDataPackagesByProvider = async (providerCode: string) => {
    try {
      setIsLoading(true);
      const packages = await Data4GService.getDataPackagesByProviderCode(providerCode);
      return packages;
    } catch (error: any) {
      console.error('Error fetching data packages:', error);
      Alert.alert(
        'Lỗi tải dữ liệu',
        'Không thể tải danh sách gói data. Vui lòng thử lại.',
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDataTopUpHistory = async (page: number = 0, size: number = 20) => {
    if (!userInfo?.id) {
      Alert.alert('Lỗi', 'Thông tin người dùng không hợp lệ');
      return null;
    }

    try {
      setIsLoading(true);
      const history = await Data4GService.getDataTopUpHistoryPaginated(
        userInfo.id,
        page,
        size
      );
      return history;
    } catch (error: any) {
      console.error('Error fetching data top-up history:', error);
      Alert.alert(
        'Lỗi tải lịch sử',
        'Không thể tải lịch sử nạp data. Vui lòng thử lại.',
      );
      return null;
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
    handleData4GTopUp,
    proceedWithData4GTopUp,
    handleVerifyFaceAuth,
    getDataPackagesByProvider,
    getDataTopUpHistory,
  };
};