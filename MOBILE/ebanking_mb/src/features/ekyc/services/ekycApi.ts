/**
 * eKYC API Service
 * Handles all backend communication for eKYC feature
 * Now routes through AuthService API Gateway
 */

import { AUTH_SERVICE } from '../../../constants/api';
import { EKYCSession } from '../types';
import { store } from '../../../store';

const BACKEND_URL = AUTH_SERVICE + '/ekyc';

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

/**
 * Create a new eKYC session
 * userId is extracted from JWT token by backend
 */
export const createEKYCSession = async (): Promise<EKYCSession> => {
  const token = getAuthToken(); // Synchronous now

  const response = await fetch(`${BACKEND_URL}/sessions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Add JWT token
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Không thể tạo session');
  }

  return result.data;
};

/**
 * Get eKYC session status
 */
export const getEKYCSessionStatus = async (
  sessionId: string,
): Promise<EKYCSession> => {
  const token = getAuthToken(); // Synchronous

  const response = await fetch(`${BACKEND_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get session status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

/**
 * Process OCR - Upload front and back images of ID card
 */
export const processOCR = async (
  sessionId: string,
  frontImagePath: string,
  backImagePath: string,
): Promise<any> => {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append('sessionId', sessionId);

  // Upload front image
  formData.append('frontImage', {
    uri: frontImagePath,
    type: 'image/jpeg',
    name: 'front.jpg',
  } as any);

  // Upload back image
  formData.append('backImage', {
    uri: backImagePath,
    type: 'image/jpeg',
    name: 'back.jpg',
  } as any);

  const response = await fetch(`${BACKEND_URL}/ocr`, {
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
    throw new Error(`OCR error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'OCR processing failed');
  }

  return result.data;
};

/**
 * Process Liveness - Upload video for liveness detection
 */
export const processLiveness = async (
  sessionId: string,
  videoPath: string,
): Promise<any> => {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('video', {
    uri: videoPath,
    type: 'video/mp4',
    name: 'liveness.mp4',
  } as any);

  const response = await fetch(`${BACKEND_URL}/liveness`, {
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
    throw new Error(`Liveness error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Liveness check failed');
  }

  return result.data;
};

/**
 * Process Face Match - Compare ID card photo with selfie
 */
export const processFaceMatch = async (sessionId: string): Promise<any> => {
  const token = getAuthToken();

  const response = await fetch(
    `${BACKEND_URL}/face-match?sessionId=${sessionId}`,
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
    throw new Error(`Face Match error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Face Match failed');
  }

  return result.data;
};
