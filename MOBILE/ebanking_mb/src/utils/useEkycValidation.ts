import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { isEkycExpired } from './ekycUtils';

/**
 * Custom hook to validate eKYC status and expiration
 * Returns validation result and helper functions
 */
export const useEkycValidation = () => {
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);

  /**
   * Check if user can perform eKYC-required actions
   * @param onInvalid - Optional callback when validation fails, receives the failure reason
   * @returns Object with validation result and reason
   */
  const validateEkyc = (
    onInvalid?: (reason: 'NOT_VERIFIED' | 'EXPIRED') => void,
  ): {
    isValid: boolean;
    reason: 'NOT_VERIFIED' | 'EXPIRED' | 'VALID';
    message?: string;
  } => {
    // Check if eKYC is verified
    if (!userInfo?.ekycStatus || userInfo.ekycStatus !== 'VERIFIED') {
      onInvalid?.('NOT_VERIFIED');
      return {
        isValid: false,
        reason: 'NOT_VERIFIED',
        message: 'Chưa xác thực eKYC',
      };
    }

    // Check if eKYC is expired
    const expired = isEkycExpired(userInfo.ekycVerifiedAt);
    if (expired) {
      onInvalid?.('EXPIRED');
      return {
        isValid: false,
        reason: 'EXPIRED',
        message: 'eKYC đã hết hạn',
      };
    }

    // eKYC is valid
    return {
      isValid: true,
      reason: 'VALID',
    };
  };

  /**
   * Get current eKYC status info
   */
  const getEkycStatus = () => ({
    isVerified: userInfo?.ekycStatus === 'VERIFIED',
    isExpired:
      userInfo?.ekycStatus === 'VERIFIED' &&
      isEkycExpired(userInfo?.ekycVerifiedAt),
    verifiedAt: userInfo?.ekycVerifiedAt,
  });

  return {
    validateEkyc,
    getEkycStatus,
    userInfo,
  };
};
