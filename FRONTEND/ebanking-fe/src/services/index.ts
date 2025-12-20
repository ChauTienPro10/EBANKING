// Export axios-based API client (existing)
export { default as apiClient } from './api';

// Export custom fetch client and utilities
export { default as fetchClient, CustomFetch } from './fetch';
export type { FetchConfig, ApiResponse, ApiError } from './fetch';

// Export fetch helpers and API endpoints
export { default as api, apiCall, fetchUtils, createApiHook } from './fetchHelpers';
export type { ApiResult } from './fetchHelpers';

// Export URL configuration
export { API_ENDPOINTS } from './URL';

// Export notification services
export * as notificationService from './notificationService';
export * as notificationAdapter from './notificationAdapter';
export * as mockNotificationService from './mock/notificationService';

// Export examples (for development/testing)
export * from './fetchExample';