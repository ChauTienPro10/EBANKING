/**
 * eKYC API Service
 * Handles all backend communication for eKYC feature
 */

import { EKYC_BACKEND_URL } from '@env';
import { EKYCSession, EKYCConfig, EKYCCallbackData } from '../types';

const BACKEND_URL = EKYC_BACKEND_URL || 'http://10.0.2.2:8008';

/**
 * Create a new eKYC session
 */
export const createEKYCSession = async (
  userId: number,
): Promise<EKYCSession> => {
  console.log('🔵 Creating eKYC session for userId:', userId);

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
