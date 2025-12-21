import fetch from '../utils/fetch';
import { EkycStatusResponse, EkycDetailModel } from '../store/UserInfoModel';
import {
  BASE_URL,
  USER_SERVICE_DIRECT,
  EKYC_SERVICE_DIRECT,
} from '../constants/api';

export const ekycApi = {
  /**
   * Get eKYC status for current user
   */
  getStatus: async (userId: number): Promise<EkycStatusResponse> => {
    const response = await fetch.get(
      `${BASE_URL}api/users/${userId}/ekyc/status`,
      {},
      true,
    );
    return response;
  },

  /**
   * Get full eKYC session details
   */
  getDetails: async (sessionId: string): Promise<EkycDetailModel> => {
    const url = `${EKYC_SERVICE_DIRECT}/api/ekyc/sessions/${sessionId}/details`;

    try {
      const response = await fetch.get(url, {}, true);

      // Backend returns ApiResponse<EkycDetailResponse> = { success: true, data: {...} }
      // fetch.get() returns the full response, so we need to access response.data
      if (response && response.data) {
        return response.data;
      }

      throw new Error('Invalid response structure from eKYC details API');
    } catch (error: any) {
      console.error('Failed to get eKYC details:', error);
      throw error;
    }
  },

  /**
   * Retry eKYC (reset status)
   * Calls userService directly on port 8001
   */
  retryEkyc: async (userId: number): Promise<void> => {
    await fetch.post(
      `${USER_SERVICE_DIRECT}/api/users/${userId}/ekyc/retry`,
      {},
      true,
    );
  },
};
