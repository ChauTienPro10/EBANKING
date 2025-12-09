/**
 * Custom Hook: useEKYCSession
 * Manages eKYC session creation
 */

import { useState, useEffect } from 'react';
import { EKYCStep } from '../types';
import { createEKYCSession } from '../services/ekycApi';
import ToastService from '../../../components/ToastService';

interface UseEKYCSessionResult {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  currentStep: EKYCStep;
}

export const useEKYCSession = (
  userId: number,
  onError?: (error: any) => void,
): UseEKYCSessionResult => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<EKYCStep>('Đang khởi tạo...');

  useEffect(() => {
    initializeSession();
  }, [userId]);

  const initializeSession = async () => {
    try {
      console.log('🚀 Starting eKYC initialization for userId:', userId);

      // Create session
      setCurrentStep('Đang tạo session...');
      const session = await createEKYCSession();
      setSessionId(session.sessionId);

      setLoading(false);
      setCurrentStep('Đã sẵn sàng');
      console.log('✅ eKYC initialization completed');
    } catch (err: any) {
      console.error('❌ eKYC initialization failed:', err);
      setError(err.message || 'Không thể khởi tạo eKYC');
      setLoading(false);
      ToastService.error('Lỗi', 'Không thể khởi tạo eKYC. Vui lòng thử lại');

      if (onError) {
        onError(err);
      }
    }
  };

  return {
    sessionId,
    loading,
    error,
    currentStep,
  };
};
