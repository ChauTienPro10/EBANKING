/*
 * Face Authentication API Service
 * Handles face auth check and verification for high-value transactions
 */
import { AUTH_SERVICE } from '../constants/api';
import { store } from '../store';
const BACKEND_URL = AUTH_SERVICE;
/**
 * Get authentication token from Redux store
 */
const getAuthToken = (): string => {
  const token = store.getState().app.loginResponse?.jwt;
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  return token;
};
export interface FaceAuthCheckResponse {
  required: boolean;
  reason: 'HIGH_AMOUNT' | 'DAILY_LIMIT' | null;
  message: string | null;
  sessionId: string | null;
  limit: string | null;
}
export interface FaceAuthVerifyResponse {
  verified: boolean;
  sessionId: string;
  confidence: number;
  message: string;
}
/**
 * Check if face authentication is required for transaction
 */
export const checkFaceAuthRequired = async (
  userId: number,
  username: string,
  amount: string,
): Promise<FaceAuthCheckResponse> => {
  const token = getAuthToken();

  // Remove commas from amount
  const cleanAmount = amount.replace(/,/g, '');
  const response = await fetch(
    `${BACKEND_URL}/ekyc/check-face-auth?userId=${userId}&username=${username}&amount=${cleanAmount}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Face auth check error: ${response.status} - ${errorText}`);
  }
  return await response.json();
};
/**
 * Verify face authentication for transaction
 * Reuses FormData pattern from ekycApi.ts
 */
export const verifyTransactionFaceAuth = async (
  userId: number,
  sessionId: string,
  videoPath: string,
): Promise<FaceAuthVerifyResponse> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('userId', userId.toString());
  formData.append('sessionId', sessionId);
  formData.append('video', {
    uri: videoPath,
    type: 'video/mp4',
    name: 'face_auth.mp4',
  } as any);
  const response = await fetch(`${BACKEND_URL}/ekyc/verify-transaction`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Face auth verification error: ${response.status} - ${errorText}`,
    );
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Face authentication failed');
  }
  return result.data;
};
