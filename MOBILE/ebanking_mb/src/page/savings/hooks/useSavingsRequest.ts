import { useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState } from '../../../store';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../../navigation/types';
import { useEkycValidation } from '../../../utils/useEkycValidation';
import { SavingsService } from '../../../services/SavingsService';
import { CreateSavingsRequestData } from '../../../types/SavingsTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useSavingsRequest = () => {
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const userInfo = useSelector(
    (state: RootState) => state.app.userInfoData,
  );
  const { validateEkyc } = useEkycValidation();

  const [isLoading, setIsLoading] = useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const handleCreateSavingsRequest = async (
    requestData: CreateSavingsRequestData,
    navigation: NavigationProp,
  ) => {
    if (!userInfo?.id || !loginResponse?.username) {
      Alert.alert('Lỗi', 'Thông tin tài khoản không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // Check eKYC for high-value cash transactions (> 5M VND)
      if (requestData.amount > 5000000) {
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

      // Create the savings request
      const result = await SavingsService.createSavingsRequest(
        requestData,
        userInfo.id,
        loginResponse.username
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Yêu cầu ${requestData.type === 'DEPOSIT' ? 'nạp' : 'rút'} tiền đã được tạo`,
      });

      // Navigate back or to success screen
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error: any) {
      console.error('Error creating savings request:', error);
      Alert.alert(
        'Lỗi',
        error.message || `Không thể tạo yêu cầu ${requestData.type === 'DEPOSIT' ? 'nạp' : 'rút'} tiền`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateSavingsRequest = (requestData: CreateSavingsRequestData): boolean => {
    if (!requestData.amount || requestData.amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return false;
    }

    if (requestData.amount < 100000) {
      Alert.alert('Lỗi', 'Số tiền tối thiểu là 100,000 VND');
      return false;
    }

    if (requestData.amount > 1000000000) {
      Alert.alert('Lỗi', 'Số tiền tối đa là 1,000,000,000 VND');
      return false;
    }

    return true;
  };

  return {
    isLoading,
    showEKYCModal,
    setShowEKYCModal,
    handleCreateSavingsRequest,
    validateSavingsRequest,
  };
};