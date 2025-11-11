/**
 * Custom Hook: useEKYCSession
 * Manages eKYC session creation and SDK initialization
 */

import { useState, useEffect } from 'react';
import { EKYCConfig, EKYCStep } from '../types';
import { createEKYCSession, initializeEKYCSDK } from '../services/ekycApi';
import ToastService from '../../../components/ToastService';

interface UseEKYCSessionResult {
  sessionId: string | null;
  sdkConfig: EKYCConfig | null;
  loading: boolean;
  error: string | null;
  currentStep: EKYCStep;
}

export const useEKYCSession = (
  userId: number,
  onError?: (error: any) => void,
): UseEKYCSessionResult => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sdkConfig, setSdkConfig] = useState<EKYCConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<EKYCStep>('Đang khởi tạo...');

  useEffect(() => {
    initializeSession();
  }, [userId]);

  const initializeSession = async () => {
    try {
      console.log('🚀 Starting eKYC initialization for userId:', userId);

      // Step 1: Create session
      setCurrentStep('Đang tạo session...');
      const session = await createEKYCSession(userId);
      setSessionId(session.sessionId);

      // Step 2: Initialize SDK
      setCurrentStep('Đang khởi tạo SDK...');
      const config = await initializeEKYCSDK(session.sessionId);
      setSdkConfig(config);

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
    sdkConfig,
    loading,
    error,
    currentStep,
  };
};
