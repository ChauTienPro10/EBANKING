/**
 * eKYC Types & Interfaces
 */

export interface EKYCSession {
  sessionId: string;
  userId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface EKYCConfig {
  apiKey: string;
  baseUrl: string;
  sessionToken: string;
  sessionId: string;
  language: string;
  callbackUrl: string;
}

export interface EKYCWebViewProps {
  userId: number;
  onClose: () => void;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: any) => void;
}

export interface EKYCCallbackData {
  sessionId: string | null;
  event: string;
  data: any;
  timestamp: number;
}

export interface EKYCWebViewMessage {
  type?: string;
  event?: string;
  data?: any;
}

export type EKYCStep =
  | 'Đang khởi tạo...'
  | 'Đang tạo session...'
  | 'Đang khởi tạo SDK...'
  | 'Đang tải giao diện...'
  | 'Đã sẵn sàng'
  | 'Đã quét CMND/CCCD'
  | 'Đã xác thực khuôn mặt'
  | 'Đang kiểm tra...'
  | 'Hoàn thành';
