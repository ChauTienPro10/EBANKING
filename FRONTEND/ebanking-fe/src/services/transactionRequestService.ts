import fetchClient from './fetch';
import type { TransactionRequest, TransactionRequestFilter, ProcessTransactionRequest } from '../types/transactionRequest';

// Helper function to extract data from API response
const fetchWithAuth = async <T>(url: string, config?: RequestInit): Promise<T> => {
  const response = await fetchClient.request<T>(url, config);
  return response.data;
};

const BASE_URL = '/api/transaction-requests';

export const transactionRequestService = {
  // Lấy danh sách transaction requests
  async getTransactionRequests(filter: TransactionRequestFilter = {}) {
    const params = new URLSearchParams();
    
    // Pagination
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    
    // Filters
    if (filter.status) params.append('status', filter.status);
    if (filter.requestType) params.append('requestType', filter.requestType);
    if (filter.userId !== undefined) params.append('userId', filter.userId.toString());
    if (filter.requestNumber) params.append('requestNumber', filter.requestNumber);
    if (filter.minAmount !== undefined) params.append('minAmount', filter.minAmount.toString());
    if (filter.maxAmount !== undefined) params.append('maxAmount', filter.maxAmount.toString());
    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);
    
    // Sorting
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);

    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
    
    return fetchWithAuth<{
      data: TransactionRequest[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNext: boolean;
      hasPrevious: boolean;
      first: boolean;
      last: boolean;
    }>(url);
  },

  // Lấy chi tiết một transaction request
  async getTransactionRequest(requestId: number) {
    return fetchWithAuth<TransactionRequest>(`${BASE_URL}/${requestId}`);
  },

  // Xử lý transaction request (approve/reject)
  async processTransactionRequest(data: ProcessTransactionRequest) {
    const { requestId, action, adminUsername, rejectionReason } = data;
    
    if (action === 'APPROVE') {
      // Call approve endpoint
      const params = new URLSearchParams();
      params.append('adminUsername', adminUsername);
      
      return fetchWithAuth<{
        data: TransactionRequest;
        success: boolean;
        message: string;
      }>(`${BASE_URL}/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });
    } else {
      // Call reject endpoint
      const params = new URLSearchParams();
      params.append('adminUsername', adminUsername);
      params.append('rejectionReason', rejectionReason || '');
      
      return fetchWithAuth<{
        data: TransactionRequest;
        success: boolean;
        message: string;
      }>(`${BASE_URL}/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });
    }
  },

  // Lấy thống kê requests
  async getRequestStats() {
    return fetchWithAuth<{
      pending: number;
      approved: number;
      rejected: number;
      completed: number;
      totalAmount: number;
    }>(`${BASE_URL}/stats`);
  }
};