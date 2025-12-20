/**
 * Notification Service Adapter
 * This file provides a unified interface that can switch between mock and real API
 */

// Import both services
import * as mockService from './mock/notificationService';
import * as realService from './notificationService';

// Configuration flag - set to false to use real API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_NOTIFICATIONS === 'true';

// Re-export types (they should be the same)
export type {
  ReceiverMode,
  Priority,
  HistoryStatus,
  SimpleUser,
  SendPayload,
  HistoryItem,
  HistoryDetail,
} from './notificationService';

// Import the correct service based on configuration
const service = USE_MOCK_DATA ? mockService : realService;

/**
 * Get list of all users/customers
 */
export const listUsers = service.listUsers;

/**
 * Get notification history with pagination and filters
 */
export const listHistory = service.listHistory;

/**
 * Get notification detail by ID
 */
export const getDetail = service.getDetail;

/**
 * Send notification
 */
export const send = service.send;

// Additional functions only available in real service
export const pushNotificationToAll = USE_MOCK_DATA 
  ? async (payload: any) => {
      console.warn('pushNotificationToAll not available in mock mode');
      return { success: false, message: 'Mock mode - function not implemented' };
    }
  : (realService as any).pushNotificationToAll;

export const deleteNotification = USE_MOCK_DATA
  ? async (id: string) => {
      console.warn('deleteNotification not available in mock mode');
      return { success: false };
    }
  : (realService as any).deleteNotification;

export const updateNotificationStatus = USE_MOCK_DATA
  ? async (id: string, status: any) => {
      console.warn('updateNotificationStatus not available in mock mode');
      return { success: false };
    }
  : (realService as any).updateNotificationStatus;

export const getNotificationStats = USE_MOCK_DATA
  ? async () => {
      console.warn('getNotificationStats not available in mock mode');
      return { total: 0, success: 0, failed: 0, scheduled: 0, pending: 0 };
    }
  : (realService as any).getNotificationStats;

export const retryNotification = USE_MOCK_DATA
  ? async (id: string) => {
      console.warn('retryNotification not available in mock mode');
      return { success: false };
    }
  : (realService as any).retryNotification;

// Utility function to check current mode
export const isUsingMockData = () => USE_MOCK_DATA;

// Function to log current service mode
export const logServiceMode = () => {
  console.log(`Notification Service Mode: ${USE_MOCK_DATA ? 'MOCK' : 'REAL API'}`);
};