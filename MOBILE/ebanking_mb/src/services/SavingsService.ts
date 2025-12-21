import { API } from '../constants/api';
import fetch from '../utils/fetch';
import {
  SavingsAccount,
  SavingsTermType,
  SavingsRequest,
  CreateSavingsAccountRequest,
  CreateSavingsRequestData,
  SavingsTransfer,
  SavingsAccountDto,
  TransferRequest,
  CashTransactionRequest,
  CashRequestResponseDto,
} from '../types/SavingsTypes';
import { transformInterestRateToSavingsTerm, transformSavingsAccountDto, transformCashRequestResponse } from '../utils/savingsUtils';

export class SavingsService {
  // Verify PIN code
  static async verifyPin(username: string, pin: string): Promise<boolean> {
    try {
      const payload = {
        username: username,
        pinCode: pin,
      };
      
      const response = await fetch.post(API.CHECK_PIN, payload, true);
      
      if (!response) {
        throw new Error(
          typeof response?.error === 'string'
            ? response.error
            : 'Xác thực mã PIN thất bại'
        );
      }
      
      // Backend returns success response if PIN is correct
      return true;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  }

  // Lấy danh sách các loại lãi suất tiết kiệm
  static async getInterestRates(): Promise<SavingsTermType[]> {
    const rates = await fetch.get(API.GET_INTEREST_RATES, {}, true);
    
    // Transform backend data to frontend format using utility function
    return rates.map(transformInterestRateToSavingsTerm);
  }

  // Tạo tài khoản tiết kiệm mới
  static async createSavingsAccount(
    data: CreateSavingsAccountRequest
  ): Promise<SavingsAccount> {
    return fetch.post(API.CREATE_SAVINGS_ACCOUNT, data, true);
  }

  // Lấy danh sách tài khoản tiết kiệm của user
  static async getSavingsAccounts(
    userId: string
  ): Promise<SavingsAccount[]> {
    const url = API.GET_SAVINGS_ACCOUNTS.replace('{userId}', userId);
    const dtos: SavingsAccountDto[] = await fetch.get(url, {}, true);
    
    // Transform backend DTOs to frontend format
    return dtos.map(transformSavingsAccountDto);
  }

  // Lấy chi tiết tài khoản tiết kiệm
  static async getSavingsAccountDetail(
    accountNumber: string
  ): Promise<SavingsAccount> {
    const url = API.GET_SAVINGS_ACCOUNT_DETAIL.replace('{accountNumber}', accountNumber);
    const dto: SavingsAccountDto = await fetch.get(url, {}, true);
    
    // Transform backend DTO to frontend format
    return transformSavingsAccountDto(dto);
  }

  // Chuyển tiền vào tài khoản tiết kiệm
  static async transferToSavings(
    data: SavingsTransfer,
    userId: number,
    username: string
  ): Promise<any> {
    const transferRequest: TransferRequest = {
      userId,
      username,
      fromAccountNumber: data.fromAccount,
      toAccountNumber: data.toAccount,
      amount: data.amount,
      currency: 'VND',
      description: data.note,
      transferType: 'PAYMENT_TO_SAVINGS',
    };
    
    return fetch.post(API.TRANSFER_TO_SAVINGS, transferRequest, true);
  }

  // Chuyển tiền từ tài khoản tiết kiệm
  static async transferFromSavings(
    data: SavingsTransfer,
    userId: number,
    username: string
  ): Promise<any> {
    const transferRequest: TransferRequest = {
      userId,
      username,
      fromAccountNumber: data.fromAccount,
      toAccountNumber: data.toAccount,
      amount: data.amount,
      currency: 'VND',
      description: data.note,
      transferType: 'SAVINGS_TO_PAYMENT',
    };
    
    return fetch.post(API.TRANSFER_FROM_SAVINGS, transferRequest, true);
  }

  // Tạo yêu cầu nạp/rút tiền mặt
  static async createSavingsRequest(
    data: CreateSavingsRequestData,
    userId: number,
    username: string
  ): Promise<SavingsRequest> {
    const cashTransactionRequest: CashTransactionRequest = {
      userId,
      username,
      savingsAccountId: parseInt(data.savingsAccountId),
      requestType: data.type === 'DEPOSIT' ? 'CASH_DEPOSIT' : 'CASH_WITHDRAWAL',
      amount: data.amount,
      currency: 'VND',
      description: data.note,
    };
    
    return fetch.post(API.CREATE_SAVINGS_REQUEST, cashTransactionRequest, true);
  }

  // Lấy danh sách yêu cầu của user
  static async getSavingsRequests(
    userId: string
  ): Promise<SavingsRequest[]> {
    const url = API.GET_SAVINGS_REQUESTS.replace('{userId}', userId);
    const dtos: CashRequestResponseDto[] = await fetch.get(url, {}, true);
    
    // Transform backend DTOs to frontend format
    return dtos.map(transformCashRequestResponse);
  }

  // Lấy chi tiết yêu cầu
  static async getSavingsRequestDetail(
    requestId: string
  ): Promise<SavingsRequest> {
    const url = API.GET_SAVINGS_REQUEST_DETAIL.replace('{requestId}', requestId);
    const dto: CashRequestResponseDto = await fetch.get(url, {}, true);
    
    // Transform backend DTO to frontend format
    return transformCashRequestResponse(dto);
  }

  // Hủy yêu cầu
  static async cancelSavingsRequest(
    requestId: string
  ): Promise<any> {
    const url = API.CANCEL_SAVINGS_REQUEST.replace('{requestId}', requestId);
    return fetch.put(url, {}, true);
  }
}