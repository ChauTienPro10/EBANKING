/**
 * useQRPayment Hook
 *
 * Custom hook for QR Payment functionality
 * Separates business logic from UI components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import QRService from '../services/qr.service';
import { QRCodeData, QRAccount } from '../types';

interface UseQRPaymentResult {
  // State
  isLoading: boolean;
  error: string | null;
  qrData: QRCodeData | null;
  countdown: number;
  isAuthenticated: boolean;
  accounts: QRAccount[];
  selectedAccount: QRAccount | null;

  // Actions
  verifyPin: (pin: string) => Promise<boolean>;
  generateQR: () => Promise<void>;
  refreshQR: () => Promise<void>;
  selectAccount: (account: QRAccount) => void;
  reset: () => void;
}

export const useQRPayment = (): UseQRPaymentResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<QRAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<QRAccount | null>(
    null,
  );

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isAuthenticated || !qrData) return;

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // QR expired, require re-authentication
          setIsAuthenticated(false);
          setQrData(null);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isAuthenticated, qrData]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const accountList = await QRService.getAccounts();
      setAccounts(accountList);
      if (accountList.length > 0) {
        setSelectedAccount(accountList[0]);
      }
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
      console.error('Load accounts error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await QRService.verifyPin({
          pin,
          accountId: selectedAccount?.id,
        });

        if (response.success) {
          setIsAuthenticated(true);
          // Auto generate QR after successful authentication
          await generateQR();
          return true;
        } else {
          setError(response.error?.message || 'Xác thực thất bại');
          return false;
        }
      } catch (err) {
        setError('Lỗi xác thực PIN');
        console.error('Verify PIN error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAccount],
  );

  const generateQR = useCallback(async () => {
    if (!selectedAccount) {
      setError('Vui lòng chọn tài khoản');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await QRService.generateQRCode({
        accountId: selectedAccount.id,
      });

      if (response.success && response.data) {
        setQrData(response.data);
        setCountdown(60); // Reset countdown
      } else {
        setError(response.error?.message || 'Không thể tạo mã QR');
      }
    } catch (err) {
      setError('Lỗi tạo mã QR');
      console.error('Generate QR error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  const refreshQR = useCallback(async () => {
    if (!selectedAccount) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await QRService.refreshQRCode(selectedAccount.id);

      if (response.success && response.data) {
        setQrData(response.data);
        setCountdown(60); // Reset countdown
      } else {
        setError(response.error?.message || 'Không thể làm mới mã QR');
      }
    } catch (err) {
      setError('Lỗi làm mới mã QR');
      console.error('Refresh QR error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  const selectAccount = useCallback((account: QRAccount) => {
    setSelectedAccount(account);
    // Reset QR when changing account
    setQrData(null);
    setIsAuthenticated(false);
    setCountdown(60);
  }, []);

  const reset = useCallback(() => {
    setIsAuthenticated(false);
    setQrData(null);
    setCountdown(60);
    setError(null);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    qrData,
    countdown,
    isAuthenticated,
    accounts,
    selectedAccount,

    // Actions
    verifyPin,
    generateQR,
    refreshQR,
    selectAccount,
    reset,
  };
};
