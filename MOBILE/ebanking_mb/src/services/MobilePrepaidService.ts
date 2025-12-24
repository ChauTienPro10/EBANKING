import fetch from '../utils/fetch';
import { API } from '../constants/api';

export interface MobileOperator {
  providerId: number;
  providerCode: string;
  providerName: string;
  logoUrl: string;
  isActive: boolean;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
  denominations: Denomination[];
}

export interface Denomination {
  denominationId: number;
  amount: number;
  displayName: string;
  sortOrder: number;
}

export interface PrepaidTransaction {
  topUpId: number;
  transactionId: string;
  phoneNumber: string;
  telecomProvider: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  providerTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
  requiresFaceAuth: boolean;
  faceAuthSessionId?: string;
  faceAuthVerified: boolean;
}

export interface PrepaidRequest {
  userId: number;
  username: string;
  accountNumber: string;
  phoneNumber: string;
  telecomProvider: string;
  amount: number;
  pin: string;
  requiresFaceAuth?: boolean;
  faceAuthSessionId?: string;
}

export interface PrepaidHistoryResponse {
  content: PrepaidTransaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

class MobilePrepaidService {
  // Lấy danh sách nhà mạng từ API
  async getMobileOperators(): Promise<MobileOperator[]> {
    try {
      const response = await fetch.get(API.GET_PHONE_TOPUP_PROVIDERS, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching mobile operators:', error);
      throw error;
    }
  }

  // Tự động nhận diện nhà mạng từ số điện thoại
  async detectOperator(phoneNumber: string): Promise<MobileOperator | null> {
    try {
      const operators = await this.getMobileOperators();
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length < 10) return null;
      
      // Logic nhận diện nhà mạng dựa trên prefix
      const prefix = cleanPhone.substring(0, 3);
      
      // Mapping prefix với provider code
      const prefixMapping: Record<string, string> = {
        // Viettel
        '086': 'VIETTEL', '096': 'VIETTEL', '097': 'VIETTEL', '098': 'VIETTEL',
        '032': 'VIETTEL', '033': 'VIETTEL', '034': 'VIETTEL', '035': 'VIETTEL',
        '036': 'VIETTEL', '037': 'VIETTEL', '038': 'VIETTEL', '039': 'VIETTEL',
        
        // VinaPhone
        '088': 'VINAPHONE', '091': 'VINAPHONE', '094': 'VINAPHONE',
        '083': 'VINAPHONE', '084': 'VINAPHONE', '085': 'VINAPHONE',
        '081': 'VINAPHONE', '082': 'VINAPHONE',
        
        // MobiFone
        '089': 'MOBIFONE', '090': 'MOBIFONE', '093': 'MOBIFONE',
        '070': 'MOBIFONE', '079': 'MOBIFONE', '077': 'MOBIFONE',
        '076': 'MOBIFONE', '078': 'MOBIFONE',
        
        // Vietnamobile
        '092': 'VIETNAMOBILE', '056': 'VIETNAMOBILE', '058': 'VIETNAMOBILE'
      };
      
      const providerCode = prefixMapping[prefix];
      if (!providerCode) return null;
      
      return operators.find(op => op.providerCode === providerCode) || null;
    } catch (error) {
      console.error('Error detecting operator:', error);
      return null;
    }
  }

  // Thực hiện nạp tiền điện thoại
  async topUpMobile(request: PrepaidRequest): Promise<PrepaidTransaction> {
    try {
      // Validate input
      if (!request.phoneNumber || !request.telecomProvider || !request.amount || !request.pin) {
        throw new Error('Missing required fields');
      }

      const response = await fetch.post(API.PHONE_TOPUP, request, true);
      return response;
    } catch (error) {
      console.error('Error processing mobile top-up:', error);
      throw error;
    }
  }

  // Xác thực Face Auth cho giao dịch nạp tiền
  async verifyFaceAuth(faceAuthSessionId: string): Promise<PrepaidTransaction> {
    try {
      const url = API.PHONE_TOPUP_VERIFY_FACE_AUTH.replace('{faceAuthSessionId}', faceAuthSessionId);
      const response = await fetch.post(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error verifying face auth:', error);
      throw error;
    }
  }

  // Lấy lịch sử nạp tiền
  async getTopUpHistory(userId: number, page: number = 0, size: number = 10): Promise<PrepaidHistoryResponse> {
    try {
      const url = API.GET_PHONE_TOPUP_HISTORY.replace('{userId}', userId.toString());
      const response = await fetch.get(`${url}?page=${page}&size=${size}`, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching top-up history:', error);
      throw error;
    }
  }

  // Lấy chi tiết giao dịch
  async getTransactionDetail(transactionId: string): Promise<PrepaidTransaction> {
    try {
      const url = API.GET_PHONE_TOPUP_TRANSACTION.replace('{transactionId}', transactionId);
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      throw error;
    }
  }

  // Validate số điện thoại Việt Nam
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneRegex = /^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
  }

  // Format số điện thoại
  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('84')) {
      return '0' + cleanPhone.substring(2);
    }
    return cleanPhone;
  }

  // Kiểm tra số tiền có hợp lệ với nhà mạng
  validateAmount(amount: number, operator: MobileOperator): boolean {
    return amount >= operator.minAmount && amount <= operator.maxAmount;
  }

  // Tính phí giao dịch
  calculateFee(amount: number, operator: MobileOperator): number {
    const percentageFee = (amount * operator.feePercentage) / 100;
    return percentageFee + operator.fixedFee;
  }

  // Tính tổng tiền cần trả (bao gồm phí)
  calculateTotalAmount(amount: number, operator: MobileOperator): number {
    return amount + this.calculateFee(amount, operator);
  }
}

export default new MobilePrepaidService();