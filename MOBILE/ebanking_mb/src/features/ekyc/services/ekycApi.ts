/**
 * eKYC API Service
 * Handles all backend communication for eKYC feature
 */

import { EKYC_BACKEND_URL } from '@env';
import { EKYCSession, EKYCConfig, EKYCCallbackData } from '../types';

const BACKEND_URL = 'http://localhost:8008';

/**
 * Create a new eKYC session
 */
export const createEKYCSession = async (
  userId: number,
): Promise<EKYCSession> => {
  const response = await fetch(
    `${BACKEND_URL}/api/ekyc/sessions?userId=${userId}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Session creation failed:', errorText);
    throw new Error(`Backend error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Không thể tạo session');
  }

  console.log('✅ Session created:', result.data.sessionId);
  return result.data;
};

/**
 * Initialize eKYC SDK and get configuration
 */
export const initializeEKYCSDK = async (
  sessionId: string,
  language: string = 'vi',
): Promise<EKYCConfig> => {
  console.log('🔵 Initializing SDK for session:', sessionId);

  const url = `${BACKEND_URL}/api/ekyc/sdk/init?sessionId=${sessionId}&language=${language}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ SDK initialization failed:', errorText);
    throw new Error(`Backend error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Không thể khởi tạo SDK');
  }

  console.log('✅ SDK initialized');
  return result.data;
};

/**
 * Send callback event to backend
 */
export const sendEKYCCallback = async (
  callbackData: EKYCCallbackData,
): Promise<void> => {
  console.log('🔵 Sending callback to backend:', callbackData.event);

  const response = await fetch(`${BACKEND_URL}/api/ekyc/sdk/callback`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(callbackData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Callback failed:', errorText);
    throw new Error(`Callback error: ${response.status}`);
  }

  const result = await response.json();
  console.log(`✅ Callback ${callbackData.event} sent successfully`);
};

/**
 * Get eKYC session status
 */
export const getEKYCSessionStatus = async (
  sessionId: string,
): Promise<EKYCSession> => {
  const response = await fetch(
    `${BACKEND_URL}/api/ekyc/sessions/${sessionId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );

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
  console.log('🔵 Processing OCR for session:', sessionId);

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

  const response = await fetch(`${BACKEND_URL}/api/ekyc/ocr`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OCR failed:', errorText);
    throw new Error(`OCR error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'OCR processing failed');
  }

  console.log('✅ OCR completed');
  return result.data;
};

/**
 * Process Liveness - Upload video for liveness detection
 */
export const processLiveness = async (
  sessionId: string,
  videoPath: string,
): Promise<any> => {
  console.log('🔵 Processing Liveness for session:', sessionId);

  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('video', {
    uri: videoPath,
    type: 'video/mp4',
    name: 'liveness.mp4',
  } as any);

  const response = await fetch(`${BACKEND_URL}/api/ekyc/liveness`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Liveness failed:', errorText);
    throw new Error(`Liveness error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Liveness check failed');
  }

  console.log('✅ Liveness completed');
  return result.data;
};

/**
 * Process Face Match - Compare ID card photo with selfie
 */
export const processFaceMatch = async (sessionId: string): Promise<any> => {
  console.log('🔵 Processing Face Match for session:', sessionId);

  const response = await fetch(
    `${BACKEND_URL}/api/ekyc/face-match?sessionId=${sessionId}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Face Match failed:', errorText);
    throw new Error(`Face Match error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Face Match failed');
  }

  console.log('✅ Face Match completed');
  return result.data;
};
