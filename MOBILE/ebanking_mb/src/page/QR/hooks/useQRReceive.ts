/**
 * useQRReceive Hook
 *
 * Custom hook for QR Receive (nhận tiền) functionality
 */

import { useState, useCallback } from 'react';
import QRService from '../services/qr.service';
import { QRCodeData, QRAccount } from '../types';

interface UseQRReceiveResult {
  isLoading: boolean;
  error: string | null;
  qrData: QRCodeData | null;
  amount: number;
  description: string;
  selectedAccount: QRAccount | null;

  setAmount: (amount: number) => void;
  setDescription: (description: string) => void;
  setSelectedAccount: (account: QRAccount) => void;
  generateReceiveQR: () => Promise<void>;
  reset: () => void;
}

export const useQRReceive = (): UseQRReceiveResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<QRAccount | null>(
    null,
  );

  const generateReceiveQR = useCallback(async () => {
    if (!selectedAccount) {
      setError('Vui lòng chọn tài khoản');
      return;
    }

    if (amount <= 0) {
      setError('Vui lòng nhập số tiền');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await QRService.generateReceiveQR({
        accountId: selectedAccount.id,
        amount,
        description,
      });

      if (response.success && response.data) {
        setQrData(response.data);
      } else {
        setError(response.error?.message || 'Không thể tạo mã QR nhận tiền');
      }
    } catch (err) {
      setError('Lỗi tạo mã QR nhận tiền');
      console.error('Generate receive QR error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, amount, description]);

  const reset = useCallback(() => {
    setQrData(null);
    setAmount(0);
    setDescription('');
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    qrData,
    amount,
    description,
    selectedAccount,

    setAmount,
    setDescription,
    setSelectedAccount,
    generateReceiveQR,
    reset,
  };
};
