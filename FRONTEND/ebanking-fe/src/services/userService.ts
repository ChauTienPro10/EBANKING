import fetchClient from './fetch';
import type { ApiResponse } from './fetch';
import { api } from './URL';

// User interface based on the API response structure
export interface User {
  id: number;
  fullName: string | null;
  citizenId: string;
  birthday: number;
  email: string;
  phone: string | null;
  isMale: boolean;
  address: string | null;
  createAt: number;
  updatedAt: number;
  userId: number;
  username: string;
  ekycSessionId: string | null;
  ekycStatus: string | null;
  ekycVerifiedAt: number | null;
  avatarPath: string | null;
  faceAuthEnabled: boolean;
  dailyTransactionLimit: number | null;
}

// API response structure
export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
}

// Simplified user interface for notifications and other components
export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
}

/**
 * Get all users from the API
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const response: ApiResponse<UserListResponse> = await fetchClient.get(api.GET_ALL_USER);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Không thể tải danh sách người dùng');
  }
}

/**
 * Convert User to SimpleUser for compatibility with existing components
 */
export function convertToSimpleUser(user: User): SimpleUser {
  return {
    id: user.id.toString(),
    name: user.fullName || user.username || user.email,
    email: user.email,
    phone: user.phone || '',
    username: user.username,
  };
}

/**
 * Get all users as SimpleUser format for notifications
 */
export async function getAllUsersAsSimple(): Promise<SimpleUser[]> {
  try {
    const users = await getAllUsers();
    return users.map(convertToSimpleUser);
  } catch (error) {
    console.error('Failed to fetch users as simple format:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string | number): Promise<User | null> {
  try {
    const users = await getAllUsers();
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    return users.find(user => user.id === userId) || null;
  } catch (error) {
    console.error('Failed to fetch user by ID:', error);
    throw new Error('Không thể tải thông tin người dùng');
  }
}

/**
 * Search users by keyword (name, email, phone, citizenId)
 */
export async function searchUsers(keyword: string): Promise<SimpleUser[]> {
  try {
    const users = await getAllUsers();
    const lowercaseKeyword = keyword.toLowerCase();
    
    const filteredUsers = users.filter(user => {
      const name = (user.fullName || user.username || '').toLowerCase();
      const email = user.email.toLowerCase();
      const phone = user.phone || '';
      const citizenId = user.citizenId || '';
      
      return name.includes(lowercaseKeyword) ||
             email.includes(lowercaseKeyword) ||
             phone.includes(keyword) ||
             citizenId.includes(keyword);
    });
    
    return filteredUsers.map(convertToSimpleUser);
  } catch (error) {
    console.error('Failed to search users:', error);
    throw new Error('Không thể tìm kiếm người dùng');
  }
}

/**
 * Get users with pagination (client-side pagination since API doesn't support it)
 */
export async function getUsersWithPagination(
  page: number = 1,
  limit: number = 10,
  searchKeyword?: string
): Promise<{
  users: SimpleUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    let users: SimpleUser[];
    
    if (searchKeyword) {
      users = await searchUsers(searchKeyword);
    } else {
      users = await getAllUsersAsSimple();
    }
    
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Failed to get users with pagination:', error);
    throw error;
  }
}

// Export all types and functions