import fetch from "../utils/fetch";
import { EkycStatusResponse, EkycDetailModel } from "../store/UserInfoModel";

export const ekycApi = {
  /**
   * Get eKYC status for current user
   */
  getStatus: async (userId: number): Promise<EkycStatusResponse> => {
    const response = await fetch.get(`/api/users/${userId}/ekyc/status`, {}, true);
    return response;
  },

  /**
   * Get full eKYC session details
   */
  getDetails: async (sessionId: string): Promise<EkycDetailModel> => {
    const response = await fetch.get(`/api/ekyc/sessions/${sessionId}/details`, {}, true);
    return response.data;
  },

  /**
   * Retry eKYC (reset status)
   */
  retryEkyc: async (userId: number): Promise<void> => {
    await fetch.post(`/api/users/${userId}/ekyc/retry`, {}, true);
  },
};
