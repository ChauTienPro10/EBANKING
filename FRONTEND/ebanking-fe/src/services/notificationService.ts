import fetchClient from './fetch';
import type { ApiResponse } from './fetch';
import { getAllUsersAsSimple, type SimpleUser } from './userService';

export type ReceiverMode = "single" | "multi" | "broadcast";
export type Priority = "low" | "normal" | "high";
export type HistoryStatus = "success" | "failed" | "scheduled" | "pending";

// Re-export SimpleUser from userService for backward compatibility
export type { SimpleUser };

export interface SendPayload {
  title: string;
  body: string;
  image?: string | null;
  link?: string;
  priority: Priority;
  scheduleTime?: string | null;
  mode: ReceiverMode;
  receivers: SimpleUser[];
  staff: string; 
}

export interface PushNotiToUserPayload {
  title: string;
  content: string;
  username: string;
}

export interface BulkPushNotiPayload {
  title: string;
  content: string;
  usernames: string[];
}

export type NotificationType = "SYSTEM" | "PERSONAL" | "TRANSACTION";

export interface NotificationHistoryDto {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  createdAt: number; // timestamp
  username?: string; // For personal notifications
  sender?: string; // For transaction notifications
  amount?: string; // For transaction notifications
  status?: string; // For transaction notifications
  noiDungGiaoDich?: string; // For transaction notifications
}

export interface HistoryItem {
  id: string;
  time: string;
  staff: string;
  title: string;
  receiverCount: number;
  priority: Priority;
  status: HistoryStatus;
}

// Keep old interface for backward compatibility, but add new one
export interface BackendHistoryResponse {
  success: boolean;
  data: NotificationHistoryDto[];
  index: number;
  limit: number;
  count: number;
  totalCount: number;
  totalPages: number;
}

export interface HistoryDetail extends HistoryItem {
  body: string;
  image?: string | null;
  link?: string;
  scheduleTime?: string | null;
  receivers: Array<SimpleUser & { status: "delivered" | "failed" | "pending" }>
}

export interface ListHistoryParams {
  index?: number; // Backend uses index instead of page
  limit?: number; // Backend uses limit instead of size
  // Remove other filters for now since backend doesn't support them yet
}

export interface SearchNotificationParams {
  title?: string;
  fromDate?: number; // timestamp
  toDate?: number; // timestamp
  type?: NotificationType | "ALL";
  username?: string;
  index?: number;
  limit?: number;
}

export interface ListHistoryResponse {
  content: NotificationHistoryDto[]; // Use the new DTO
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

import { ENDPOINTS } from './URL';

/**
 * Helper function to format timestamp to readable date
 */
export function formatNotificationDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Helper function to get notification type display text
 */
export function getNotificationTypeText(type: NotificationType): string {
  const typeMap = {
    SYSTEM: 'Hệ thống',
    PERSONAL: 'Cá nhân',
    TRANSACTION: 'Giao dịch',
  };
  return typeMap[type] || type;
}

/**
 * Helper function to format notification for display
 */
export function formatNotificationForDisplay(notification: NotificationHistoryDto) {
  return {
    id: notification.id.toString(),
    title: notification.title,
    content: notification.content,
    type: notification.type,
    typeText: getNotificationTypeText(notification.type),
    time: formatNotificationDate(notification.createdAt),
    timestamp: notification.createdAt,
    username: notification.username,
    sender: notification.sender,
    amount: notification.amount,
    status: notification.status,
    noiDungGiaoDich: notification.noiDungGiaoDich,
  };
}

/**
 * Get list of all users/customers
 * Now uses the new userService with proper API response handling
 */
export async function listUsers(): Promise<SimpleUser[]> {
  try {
    return await getAllUsersAsSimple();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Không thể tải danh sách người dùng');
  }
}

/**
 * Get notification history with pagination
 */
export async function listHistory(params: ListHistoryParams = {}): Promise<ListHistoryResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Backend uses index and limit instead of page and size
    queryParams.append('index', (params.index || 0).toString());
    queryParams.append('limit', (params.limit || 10).toString());

    const response: ApiResponse<BackendHistoryResponse> = await fetchClient.get(
      `${ENDPOINTS.NOTIFICATION_HISTORY}?${queryParams.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error('Failed to fetch notification history');
    }

    // Convert backend response to frontend format
    const backendData = response.data;
    return {
      content: backendData.data,
      total: backendData.totalCount,
      page: backendData.index + 1, // Convert index to page (1-based)
      size: backendData.limit,
      totalPages: backendData.totalPages,
    };
  } catch (error) {
    console.error('Failed to fetch notification history:', error);
    throw new Error('Không thể tải lịch sử thông báo');
  }
}

/**
 * Search notifications with filters
 */
export async function searchNotifications(params: SearchNotificationParams): Promise<ListHistoryResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add search parameters
    if (params.title && params.title.trim()) {
      queryParams.append('title', params.title.trim());
    }
    
    if (params.fromDate) {
      queryParams.append('fromDate', params.fromDate.toString());
    }
    
    if (params.toDate) {
      queryParams.append('toDate', params.toDate.toString());
    }
    
    if (params.type && params.type !== 'ALL') {
      queryParams.append('type', params.type);
    }
    
    if (params.username && params.username.trim()) {
      queryParams.append('username', params.username.trim());
    }
    
    // Pagination
    queryParams.append('index', (params.index || 0).toString());
    queryParams.append('limit', (params.limit || 10).toString());

    const response: ApiResponse<BackendHistoryResponse> = await fetchClient.get(
      `${ENDPOINTS.NOTIFICATION_SEARCH}?${queryParams.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error('Failed to search notifications');
    }

    // Convert backend response to frontend format
    const backendData = response.data;
    return {
      content: backendData.data,
      total: backendData.totalCount,
      page: backendData.index + 1, // Convert index to page (1-based)
      size: backendData.limit,
      totalPages: backendData.totalPages,
    };
  } catch (error) {
    console.error('Failed to search notifications:', error);
    throw new Error('Không thể tìm kiếm thông báo');
  }
}

/**
 * Get notification detail by ID
 */
export async function getDetail(id: string): Promise<HistoryDetail | null> {
  try {
    const response: ApiResponse<HistoryDetail> = await fetchClient.get(
      ENDPOINTS.NOTIFICATION_BY_ID(id)
    );
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error('Failed to fetch notification detail:', error);
    throw new Error('Không thể tải chi tiết thông báo');
  }
}

/**
 * Send notification
 */
export async function send(payload: SendPayload): Promise<{ id: string }> {
  try {
    if (payload.mode === 'broadcast') {
      // Broadcast to all users
      const requestPayload = {
        title: payload.title,
        content: payload.body,
        image: payload.image,
        link: payload.link,
        priority: payload.priority,
        scheduleTime: payload.scheduleTime,
        staff: payload.staff,
      };
      
      const response: ApiResponse<{ id: string }> = await fetchClient.post(
        ENDPOINTS.PUSH_NOTI_SYS_TO_ALL,
        requestPayload
      );
      
      return response.data;
    } else if (payload.mode === 'single' && payload.receivers.length === 1) {
      // Single user notification using new endpoint
      const user = payload.receivers[0];
      const requestPayload: PushNotiToUserPayload = {
        title: payload.title,
        content: payload.body,
        username: user.username, // Now we have username directly
      };
      
      const response: ApiResponse<{ success: boolean; message: string }> = await fetchClient.post(
        ENDPOINTS.PUSH_NOTI_TO_USER,
        requestPayload
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send notification');
      }
      
      // Convert response format to match expected return type
      return { id: `single-${Date.now()}` }; // Generate a temporary ID
    } else {
      // Multi-user notification - use bulk endpoint
      const usernames = payload.receivers.map(user => user.username);
      const requestPayload: BulkPushNotiPayload = {
        title: payload.title,
        content: payload.body,
        usernames: usernames,
      };
      
      const response: ApiResponse<{
        success: boolean;
        message: string;
        successCount?: number;
        failedCount?: number;
        results?: Array<{ username: string; success: boolean; message?: string }>;
      }> = await fetchClient.post(
        ENDPOINTS.PUSH_NOTI_TO_USERS,
        requestPayload
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send notifications');
      }
      
      console.log('Bulk notification result:', response.data);
      return { id: `multi-${Date.now()}` }; // Generate a temporary ID
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error('Không thể gửi thông báo');
  }
}

/**
 * Push notification to all users (system notification)
 */
export async function pushNotificationToAll(payload: {
  title: string;
  body: string;
  image?: string;
  link?: string;
  priority?: Priority;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response: ApiResponse<{ success: boolean; message: string }> = await fetchClient.post(
      ENDPOINTS.PUSH_NOTI_SYS_TO_ALL,
      payload
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to push notification to all:', error);
    throw new Error('Không thể gửi thông báo hệ thống');
  }
}

/**
 * Push notification to a specific user
 */
export async function pushNotificationToUser(payload: PushNotiToUserPayload): Promise<{ success: boolean; message: string }> {
  try {
    const response: ApiResponse<{ success: boolean; message: string }> = await fetchClient.post(
      ENDPOINTS.PUSH_NOTI_TO_USER,
      payload
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to push notification to user:', error);
    throw new Error('Không thể gửi thông báo đến người dùng');
  }
}

/**
 * Push notification to multiple users (bulk)
 */
export async function pushNotificationToUsers(payload: BulkPushNotiPayload): Promise<{
  success: boolean;
  message: string;
  successCount?: number;
  failedCount?: number;
  results?: Array<{ username: string; success: boolean; message?: string }>;
}> {
  try {
    const response: ApiResponse<{
      success: boolean;
      message: string;
      successCount?: number;
      failedCount?: number;
      results?: Array<{ username: string; success: boolean; message?: string }>;
    }> = await fetchClient.post(
      ENDPOINTS.PUSH_NOTI_TO_USERS,
      payload
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to push notification to users:', error);
    throw new Error('Không thể gửi thông báo đến danh sách người dùng');
  }
}

/**
 * Delete notification by ID
 */
export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  try {
    const response: ApiResponse<{ success: boolean }> = await fetchClient.delete(
      ENDPOINTS.NOTIFICATION_BY_ID(id)
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw new Error('Không thể xóa thông báo');
  }
}

/**
 * Update notification status (for scheduled notifications)
 */
export async function updateNotificationStatus(
  id: string, 
  status: HistoryStatus
): Promise<{ success: boolean }> {
  try {
    const response: ApiResponse<{ success: boolean }> = await fetchClient.patch(
      ENDPOINTS.NOTIFICATION_BY_ID(id),
      { status }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to update notification status:', error);
    throw new Error('Không thể cập nhật trạng thái thông báo');
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  total: number;
  success: number;
  failed: number;
  scheduled: number;
  pending: number;
}> {
  try {
    const response: ApiResponse<{
      total: number;
      success: number;
      failed: number;
      scheduled: number;
      pending: number;
    }> = await fetchClient.get(ENDPOINTS.NOTIFICATION_STATS);
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification stats:', error);
    throw new Error('Không thể tải thống kê thông báo');
  }
}

/**
 * Retry failed notification
 */
export async function retryNotification(id: string): Promise<{ success: boolean }> {
  try {
    const response: ApiResponse<{ success: boolean }> = await fetchClient.post(
      ENDPOINTS.NOTIFICATION_RETRY(id)
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to retry notification:', error);
    throw new Error('Không thể thử lại gửi thông báo');
  }
}

/**
 * Get recent notifications for dashboard
 */
export async function getRecentNotifications(limit: number = 10) {
  try {
    const result = await listHistory({ index: 0, limit });
    
    return result.content.map(notification => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: getNotificationTypeText(notification.type),
      time: formatNotificationForDisplay(notification).time,
      isTransaction: notification.type === 'TRANSACTION',
      amount: notification.amount,
      username: notification.username,
    }));
  } catch (error) {
    console.error('Failed to get recent notifications:', error);
    throw new Error('Không thể tải thông báo gần đây');
  }
}

// Export all types and functions