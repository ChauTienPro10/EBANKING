// QR Module Type Definitions

export interface QRAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  bankName?: string;
  type: 'WALLET' | 'BANK' | 'CARD';
}

export interface QRCodeData {
  qrContent: string; // QR code content/data
  barcodeContent: string; // Barcode content
  expiresAt: string; // ISO timestamp
  transactionId: string;
  amount?: number;
  merchantInfo?: {
    name: string;
    id: string;
  };
}

export interface QRGenerateRequest {
  accountId: string;
  amount?: number;
  description?: string;
}

export interface QRGenerateResponse {
  success: boolean;
  data?: QRCodeData;
  error?: {
    code: string;
    message: string;
  };
}

export interface QRVerifyPinRequest {
  pin: string;
  accountId?: string;
}

export interface QRVerifyPinResponse {
  success: boolean;
  token?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface QRReceiveRequest {
  accountId: string;
  amount: number;
  description?: string;
}

export interface QRScanResult {
  type: 'QR' | 'BARCODE';
  content: string;
  timestamp: string;
}

export interface QRTransactionHistory {
  id: string;
  type: 'PAYMENT' | 'RECEIVE';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  merchantInfo?: {
    name: string;
    id: string;
  };
}
