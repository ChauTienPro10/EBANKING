/**
 * QR Service - API Integration Layer
 *
 * This service handles all API calls for QR functionality.
 * When backend is ready, replace mock implementations with actual API calls.
 */

import {
  QRGenerateRequest,
  QRGenerateResponse,
  QRVerifyPinRequest,
  QRVerifyPinResponse,
  QRCodeData,
  QRAccount,
  QRReceiveRequest,
  QRScanResult,
  QRTransactionHistory,
} from '../types';

// TODO: Replace with actual API base URL from config
// import Config from 'react-native-config';
// const API_BASE_URL = Config.API_BASE_URL || 'https://api.ebanking.com';
const API_BASE_URL = 'https://api.ebanking.com';

class QRService {
  /**
   * Verify PIN before showing QR code
   *
   * @param request - PIN verification request
   * @returns Promise<QRVerifyPinResponse>
   *
   * TODO: Replace with actual API call
   * Example: POST /api/v1/qr/verify-pin
   */
  async verifyPin(request: QRVerifyPinRequest): Promise<QRVerifyPinResponse> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        if (request.pin === '1111') {
          resolve({
            success: true,
            token: 'mock_token_' + Date.now(),
          });
        } else {
          resolve({
            success: false,
            error: {
              code: 'INVALID_PIN',
              message: 'Mã PIN không đúng',
            },
          });
        }
      }, 500); // Simulate network delay
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/qr/verify-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(request),
    });
    return response.json();
    */
  }

  /**
   * Generate QR code for payment
   *
   * @param request - QR generation request
   * @returns Promise<QRGenerateResponse>
   *
   * TODO: Replace with actual API call
   * Example: POST /api/v1/qr/generate
   */
  async generateQRCode(
    request: QRGenerateRequest,
  ): Promise<QRGenerateResponse> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        const qrData: QRCodeData = {
          qrContent: `PAYMENT_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          barcodeContent: `BC${Date.now()}${Math.floor(Math.random() * 10000)}`,
          expiresAt: new Date(Date.now() + 60000).toISOString(), // 60 seconds
          transactionId: 'TXN' + Date.now(),
          amount: request.amount,
        };

        resolve({
          success: true,
          data: qrData,
        });
      }, 300);
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(request),
    });
    return response.json();
    */
  }

  /**
   * Refresh QR code (generate new one)
   *
   * @param accountId - Account ID
   * @returns Promise<QRGenerateResponse>
   *
   * TODO: Replace with actual API call
   * Example: POST /api/v1/qr/refresh
   */
  async refreshQRCode(accountId: string): Promise<QRGenerateResponse> {
    return this.generateQRCode({ accountId });
  }

  /**
   * Get user accounts for QR payment
   *
   * @returns Promise<QRAccount[]>
   *
   * TODO: Replace with actual API call
   * Example: GET /api/v1/accounts
   */
  async getAccounts(): Promise<QRAccount[]> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 'acc_1',
            name: 'Ví MoMo',
            accountNumber: '0123456789',
            balance: 132915,
            type: 'WALLET',
          },
          {
            id: 'acc_2',
            name: 'Tài khoản VietcomBank',
            accountNumber: '9876543210',
            balance: 5000000,
            bankName: 'VietcomBank',
            type: 'BANK',
          },
          {
            id: 'acc_3',
            name: 'Thẻ Visa',
            accountNumber: '**** 1234',
            balance: 10000000,
            bankName: 'Techcombank',
            type: 'CARD',
          },
        ]);
      }, 200);
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
    */
  }

  /**
   * Generate QR code for receiving money
   *
   * @param request - Receive request with amount
   * @returns Promise<QRGenerateResponse>
   *
   * TODO: Replace with actual API call
   * Example: POST /api/v1/qr/receive
   */
  async generateReceiveQR(
    request: QRReceiveRequest,
  ): Promise<QRGenerateResponse> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        const qrData: QRCodeData = {
          qrContent: `RECEIVE_${request.accountId}_${
            request.amount
          }_${Date.now()}`,
          barcodeContent: `RC${Date.now()}${Math.floor(Math.random() * 10000)}`,
          expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
          transactionId: 'RCV' + Date.now(),
          amount: request.amount,
        };

        resolve({
          success: true,
          data: qrData,
        });
      }, 300);
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/qr/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(request),
    });
    return response.json();
    */
  }

  /**
   * Process scanned QR code
   *
   * @param scanResult - Scanned QR/Barcode data
   * @returns Promise<any> - Transaction info
   *
   * TODO: Replace with actual API call
   * Example: POST /api/v1/qr/scan
   */
  async processScan(scanResult: QRScanResult): Promise<any> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            merchantName: 'Cửa hàng ABC',
            amount: 50000,
            description: 'Thanh toán đơn hàng #12345',
          },
        });
      }, 400);
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/qr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(scanResult),
    });
    return response.json();
    */
  }

  /**
   * Get QR transaction history
   *
   * @returns Promise<QRTransactionHistory[]>
   *
   * TODO: Replace with actual API call
   * Example: GET /api/v1/qr/transactions
   */
  async getTransactionHistory(): Promise<QRTransactionHistory[]> {
    // Mock implementation - Remove when BE is ready
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 'txn_1',
            type: 'PAYMENT',
            amount: 50000,
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
            merchantInfo: {
              name: 'Cửa hàng ABC',
              id: 'merchant_1',
            },
          },
        ]);
      }, 300);
    });

    // TODO: Uncomment when BE is ready
    /*
    const response = await fetch(`${API_BASE_URL}/api/v1/qr/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
    */
  }
}

// Helper function to get auth token
// TODO: Implement actual token retrieval from storage/context
function getAuthToken(): string {
  return 'mock_auth_token';
}

export default new QRService();
