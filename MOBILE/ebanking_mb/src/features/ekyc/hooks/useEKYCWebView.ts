/**
 * Custom Hook: useEKYCWebView
 * Handles WebView messages and callbacks
 */

import { useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import { EKYCWebViewMessage, EKYCStep } from '../types';
import { sendEKYCCallback } from '../services/ekycApi';
import ToastService from '../../../components/ToastService';

interface UseEKYCWebViewResult {
  webViewReady: boolean;
  currentStep: EKYCStep;
  handleWebViewMessage: (event: WebViewMessageEvent) => Promise<void>;
}

export const useEKYCWebView = (
  sessionId: string | null,
  onSuccess?: (sessionId: string) => void,
  onError?: (error: any) => void,
): UseEKYCWebViewResult => {
  const [webViewReady, setWebViewReady] = useState(false);
  const [currentStep, setCurrentStep] = useState<EKYCStep>('Đã sẵn sàng');

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const message: EKYCWebViewMessage = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message from FPT AI SDK:', message);

      // Xử lý message ekycReady để ẩn loading
      if (message.type === 'ekycReady') {
        console.log('✅ eKYC interface ready');
        setWebViewReady(true);
        return;
      }

      // SDK FPT AI sẽ gửi các event: onOCRSuccess, onLivenessSuccess, onFaceMatchSuccess, onComplete, onError
      if (message.event === 'onError') {
        console.error('❌ SDK Error:', message.data);
        ToastService.error('Lỗi', message.data?.message || 'Có lỗi xảy ra');

        if (onError) {
          onError(message.data);
        }
        return;
      }

      // Event documentTypeSelected chỉ là UI local, không cần gửi backend
      if (message.event === 'documentTypeSelected') {
        console.log('📄 Document type selected:', message.data?.documentType);
        setCurrentStep('Đang tải giao diện...');
        return;
      }

      // Gửi callback về backend để backend lưu lại (chỉ với các event chính)
      if (sessionId && message.event) {
        const callbackData = {
          sessionId,
          event: message.event,
          data: message.data,
          timestamp: Date.now(),
        };

        await sendEKYCCallback(callbackData);

        // Cập nhật UI theo từng bước
        updateStepByEvent(message.event);

        // Kiểm tra nếu hoàn thành
        if (message.event === 'onComplete') {
          console.log('✅ eKYC completed successfully!');
          setCurrentStep('Hoàn thành');

          if (onSuccess && sessionId) {
            onSuccess(sessionId);
          }
        }
      }
    } catch (err: any) {
      console.error('❌ Error processing WebView message:', err);
    }
  };

  const updateStepByEvent = (event: string) => {
    switch (event) {
      case 'onOCRSuccess':
        setCurrentStep('Đã quét CMND/CCCD');
        ToastService.success('Thành công', 'Đã quét CMND/CCCD');
        break;
      case 'onLivenessSuccess':
        setCurrentStep('Đã xác thực khuôn mặt');
        ToastService.success('Thành công', 'Đã xác thực khuôn mặt');
        break;
      case 'onFaceMatchSuccess':
        setCurrentStep('Đang kiểm tra...');
        ToastService.success('Thành công', 'Đã so khớp khuôn mặt');
        break;
      default:
        break;
    }
  };

  return {
    webViewReady,
    currentStep,
    handleWebViewMessage,
  };
};
