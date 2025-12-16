import { AUTH_SERVICE } from '../constants/api';

export interface ChangePasswordRequest {
  username: string;
  oldPassword: string;
  password: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  description: string;
}

export const CHANGE_PASSWORD_URL = `${AUTH_SERVICE}/auth/change-password`;

class AuthService {
  /**
   * Change user password
   * @param request - Change password request with username, old password, and new password
   * @param token - JWT authentication token
   * @returns Promise with change password response
   */
  async changePassword(
    request: ChangePasswordRequest,
    token: string,
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('unauthorized');
        }
        throw new Error('network_error');
      }

      const data: ChangePasswordResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Change password error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('network_error');
    }
  }
}

export const authService = new AuthService();
