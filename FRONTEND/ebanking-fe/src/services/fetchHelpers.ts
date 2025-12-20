import fetchClient, { type ApiResponse, type FetchConfig } from './fetch';
import { ENDPOINTS } from './URL';

// Type-safe API response wrapper
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// Helper function to wrap API calls with error handling
export async function apiCall<T>(
  apiFunction: () => Promise<ApiResponse<T>>
): Promise<ApiResult<T>> {
  try {
    const response = await apiFunction();
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred',
      status: error.status,
    };
  }
}

// Common API endpoints helpers
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchClient.post(ENDPOINTS.AUTH_LOGIN, credentials),
    
    logout: () =>
      fetchClient.post(ENDPOINTS.AUTH_LOGOUT),
    
    refresh: (refreshToken: string) =>
      fetchClient.post(ENDPOINTS.AUTH_REFRESH, { refreshToken }),
    
    register: (userData: { email: string; password: string; name: string }) =>
      fetchClient.post(ENDPOINTS.AUTH_REGISTER, userData),
  },

  // Users
  users: {
    getProfile: () =>
      fetchClient.get(ENDPOINTS.USER_PROFILE),
    
    updateProfile: (data: any) =>
      fetchClient.put(ENDPOINTS.USER_PROFILE, data),
    
    // Get all users - uses GET_ALL_USER endpoint with proper response structure
    getUsers: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.USERS}${queryString}`);
    },
    
    // Get all users using the legacy endpoint (returns wrapped response)
    getAllUsers: () => {
      return fetchClient.get('/users');
    },
    
    getUserById: (id: string) =>
      fetchClient.get(ENDPOINTS.USER_BY_ID(id)),
    
    createUser: (userData: any) =>
      fetchClient.post(ENDPOINTS.USERS, userData),
    
    updateUser: (id: string, userData: any) =>
      fetchClient.put(ENDPOINTS.USER_BY_ID(id), userData),
    
    deleteUser: (id: string) =>
      fetchClient.delete(ENDPOINTS.USER_BY_ID(id)),
  },

  // Notifications
  notifications: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.NOTIFICATIONS}${queryString}`);
    },
    
    getHistory: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.NOTIFICATION_HISTORY}${queryString}`);
    },
    
    getById: (id: string) =>
      fetchClient.get(ENDPOINTS.NOTIFICATION_BY_ID(id)),
    
    create: (notificationData: any) =>
      fetchClient.post(ENDPOINTS.NOTIFICATIONS, notificationData),
    
    send: (notificationData: any) =>
      fetchClient.post(ENDPOINTS.NOTIFICATION_SEND, notificationData),
    
    update: (id: string, notificationData: any) =>
      fetchClient.put(ENDPOINTS.NOTIFICATION_BY_ID(id), notificationData),
    
    delete: (id: string) =>
      fetchClient.delete(ENDPOINTS.NOTIFICATION_BY_ID(id)),
    
    retry: (id: string) =>
      fetchClient.post(ENDPOINTS.NOTIFICATION_RETRY(id)),
    
    pushToAll: (payload: any) =>
      fetchClient.post(ENDPOINTS.PUSH_NOTI_SYS_TO_ALL, payload),
    
    getStats: () =>
      fetchClient.get(ENDPOINTS.NOTIFICATION_STATS),
    
    markAsRead: (id: string) =>
      fetchClient.patch(ENDPOINTS.NOTIFICATION_READ(id)),
    
    markAllAsRead: () =>
      fetchClient.patch(ENDPOINTS.NOTIFICATION_READ_ALL),
  },

  // Accounts
  accounts: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.ACCOUNTS}${queryString}`);
    },
    
    getById: (id: string) =>
      fetchClient.get(ENDPOINTS.ACCOUNT_BY_ID(id)),
    
    create: (accountData: any) =>
      fetchClient.post(ENDPOINTS.ACCOUNTS, accountData),
    
    update: (id: string, accountData: any) =>
      fetchClient.put(ENDPOINTS.ACCOUNT_BY_ID(id), accountData),
    
    delete: (id: string) =>
      fetchClient.delete(ENDPOINTS.ACCOUNT_BY_ID(id)),
  },

  // Transactions
  transactions: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.TRANSACTIONS}${queryString}`);
    },
    
    getById: (id: string) =>
      fetchClient.get(ENDPOINTS.TRANSACTION_BY_ID(id)),
    
    create: (transactionData: any) =>
      fetchClient.post(ENDPOINTS.TRANSACTIONS, transactionData),
    
    update: (id: string, transactionData: any) =>
      fetchClient.put(ENDPOINTS.TRANSACTION_BY_ID(id), transactionData),
    
    delete: (id: string) =>
      fetchClient.delete(ENDPOINTS.TRANSACTION_BY_ID(id)),
  },

  // Loans
  loans: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.LOANS}${queryString}`);
    },
    
    getById: (id: string) =>
      fetchClient.get(ENDPOINTS.LOAN_BY_ID(id)),
    
    create: (loanData: any) =>
      fetchClient.post(ENDPOINTS.LOANS, loanData),
    
    update: (id: string, loanData: any) =>
      fetchClient.put(ENDPOINTS.LOAN_BY_ID(id), loanData),
    
    delete: (id: string) =>
      fetchClient.delete(ENDPOINTS.LOAN_BY_ID(id)),
  },

  // Tickets
  tickets: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchClient.get(`${ENDPOINTS.TICKETS}${queryString}`);
    },
    
    getById: (id: string) =>
      fetchClient.get(ENDPOINTS.TICKET_BY_ID(id)),
    
    create: (ticketData: any) =>
      fetchClient.post(ENDPOINTS.TICKETS, ticketData),
    
    update: (id: string, ticketData: any) =>
      fetchClient.put(ENDPOINTS.TICKET_BY_ID(id), ticketData),
    
    delete: (id: string) =>
      fetchClient.delete(ENDPOINTS.TICKET_BY_ID(id)),
  },

  // File upload
  upload: {
    single: (file: File, endpoint = ENDPOINTS.UPLOAD) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchClient.upload(endpoint, formData);
    },
    
    multiple: (files: File[], endpoint = ENDPOINTS.UPLOAD_MULTIPLE) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      return fetchClient.upload(endpoint, formData);
    },
    
    avatar: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchClient.upload(ENDPOINTS.UPLOAD_AVATAR, formData);
    },
  },
};

// Custom hook-like function for React components
export function createApiHook<T>(apiFunction: () => Promise<ApiResponse<T>>) {
  return async (): Promise<ApiResult<T>> => {
    return apiCall(apiFunction);
  };
}

// Utility functions
export const fetchUtils = {
  // Create query string from object
  createQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  // Download file from response
  downloadFile: async (url: string, filename?: string, config?: FetchConfig) => {
    try {
      const response = await fetchClient.request(url, {
        ...config,
        headers: {
          ...config?.headers,
        },
      });

      // Create blob from response data
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Download failed' 
      };
    }
  },
};

export default api;