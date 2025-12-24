import { create } from 'zustand';
import type { TransactionRequest, TransactionRequestFilter } from '../types/transactionRequest';
import { transactionRequestService } from '../services/transactionRequestService';

interface TransactionRequestState {
  requests: TransactionRequest[];
  selectedRequest: TransactionRequest | null;
  loading: boolean;
  error: string | null;
  filter: TransactionRequestFilter;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    totalAmount: number;
  } | null;
}

interface TransactionRequestActions {
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: number) => Promise<void>;
  processRequest: (requestId: number, action: 'APPROVE' | 'REJECT', adminUsername: string, rejectionReason?: string) => Promise<string>;
  fetchStats: () => Promise<void>;
  setFilter: (filter: Partial<TransactionRequestFilter>) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  setSelectedRequest: (request: TransactionRequest | null) => void;
}

export const useTransactionRequestStore = create<TransactionRequestState & TransactionRequestActions>((set, get) => ({
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  filter: {
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  },
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false
  },
  stats: null,

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const { filter } = get();
      const response = await transactionRequestService.getTransactionRequests(filter);
      
      console.log('API Response:', response); // Debug log
      
      // Ensure response.data is always an array
      const requests = Array.isArray(response.data) ? response.data : [];
      
      console.log('Parsed requests:', requests); // Debug log
      
      set({
        requests,
        pagination: {
          page: response.currentPage || 0,
          size: response.pageSize || 20,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          first: response.first || true,
          last: response.last || false
        },
        loading: false
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách requests',
        loading: false,
        requests: [] // Ensure requests is always an array even on error
      });
    }
  },

  fetchRequestById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const request = await transactionRequestService.getTransactionRequest(id);
      set({ selectedRequest: request, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải chi tiết request',
        loading: false 
      });
    }
  },

  processRequest: async (requestId: number, action: 'APPROVE' | 'REJECT', adminUsername: string, rejectionReason?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionRequestService.processTransactionRequest({
        requestId,
        action,
        adminUsername,
        rejectionReason
      });
      
      console.log('Process response:', response);
      
      // Refresh danh sách sau khi xử lý
      await get().fetchRequests();
      await get().fetchStats();
      
      set({ loading: false });
      
      // Return success message
      return response.message || 'Xử lý thành công';
    } catch (error) {
      console.error('Error processing request:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý request',
        loading: false 
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await transactionRequestService.getRequestStats();
      
      // Ensure all stats values are numbers
      const safeStats = {
        pending: typeof stats.pending === 'number' ? stats.pending : 0,
        approved: typeof stats.approved === 'number' ? stats.approved : 0,
        rejected: typeof stats.rejected === 'number' ? stats.rejected : 0,
        completed: typeof stats.completed === 'number' ? stats.completed : 0,
        totalAmount: typeof stats.totalAmount === 'number' ? stats.totalAmount : 0
      };
      
      set({ stats: safeStats });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      set({ 
        stats: {
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
          totalAmount: 0
        }
      });
    }
  },

  setFilter: (newFilter: Partial<TransactionRequestFilter>) => {
    set(state => ({
      filter: { ...state.filter, ...newFilter, page: 0 },
      pagination: { ...state.pagination, page: 0 }
    }));
  },

  setPage: (page: number) => {
    set(state => ({
      filter: { ...state.filter, page },
      pagination: { ...state.pagination, page }
    }));
  },

  clearError: () => set({ error: null }),

  setSelectedRequest: (request: TransactionRequest | null) => {
    set({ selectedRequest: request });
  }
}));