/**
 * eKYC Configuration
 * Centralized config for eKYC flow behavior
 */

export const EKYC_CONFIG = {
  // =========================================================================
  // MOCK MODE CONTROL - Toggle này để bật/tắt chế độ mock
  // =========================================================================
  //
  // 🎨 KHI LÀM UI/UX: Bật mock để không tốn API requests
  //    USE_MOCK_DATA: true
  //
  // 🚀 KHI TEST API THẬT: Tắt mock để gọi API thật
  //    USE_MOCK_DATA: false
  //
  // =========================================================================
  USE_MOCK_DATA: false, // ⚠️ THAY ĐỔI ĐÂY để bật/tắt mock mode

  // Mock response delay (milliseconds) - simulates network latency
  MOCK_DELAY: 1500,

  // Mock success rate (0-1) - for testing error scenarios
  MOCK_SUCCESS_RATE: 1.0, // 1.0 = always success, 0.5 = 50% fail rate
};

/**
 * Mock Data for eKYC responses
 */
export const MOCK_EKYC_DATA = {
  session: {
    sessionId: 'mock-session-' + Date.now(),
    status: 'created',
  },
  ocr: {
    success: true,
    data: {
      id: '001234567890',
      name: 'NGUYỄN VĂN A',
      dob: '01/01/1990',
      address: 'Hà Nội, Việt Nam',
    },
  },
  liveness: {
    success: true,
    score: 0.98,
    isLive: true,
  },
  faceMatch: {
    success: true,
    similarity: '96%',
    confidence: 0.96,
  },
};

/**
 * Helper function to simulate API call with mock data
 */
export const mockApiCall = async <T>(
  mockData: T,
  delay: number = EKYC_CONFIG.MOCK_DELAY,
): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simulate random failures based on success rate
  if (Math.random() > EKYC_CONFIG.MOCK_SUCCESS_RATE) {
    throw new Error('Mock API Error: Simulated failure for testing');
  }

  return mockData;
};
