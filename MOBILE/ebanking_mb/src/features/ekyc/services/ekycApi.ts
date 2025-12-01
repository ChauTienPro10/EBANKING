/**
 * eKYC API Service
 * Handles all backend communication for eKYC feature
 */

import { EKYC_BACKEND_URL } from '@env';
import { EKYCSession } from '../types';

const BACKEND_URL = EKYC_BACKEND_URL || 'http://10.0.2.2:8081';

// 🔍 DEBUG: Log backend URL để kiểm tra
console.log('🔍 EKYC_BACKEND_URL from .env:', EKYC_BACKEND_URL);
console.log('🔍 BACKEND_URL being used:', BACKEND_URL);

/**
 * Create a new eKYC session
 */
export const createEKYCSession = async (
  userId: number,
): Promise<EKYCSession> => {
  console.log('🔵 Creating eKYC session for userId:', userId);
  console.log(
    '🔵 Full URL:',
    `${BACKEND_URL}/api/ekyc/sessions?userId=${userId}`,
  );

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
  console.log(
    '📊 Face Match result.data:',
    JSON.stringify(result.data, null, 2),
  );
  return result.data;
};
