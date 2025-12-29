export const HOST_SERVER_ADMIN = "3.85.17.154";
const ADMIN_PORT = 7999;
const URL_ADMIN = `http://${HOST_SERVER_ADMIN}:${ADMIN_PORT}`;

// Base URLs
export const BASE_URLS = {
  ADMIN: URL_ADMIN,
  DEFAULT_API: URL_ADMIN,
} as const;

// API Endpoints - Relative paths
export const ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/auth/login",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REGISTER: "/auth/register",

  // Users
  USERS: "/users",
  USER_PROFILE: "/users/profile",
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_HISTORY: "/notification/history",
  NOTIFICATION_SEARCH: "/notification/search",
  NOTIFICATION_SEND: "/notifications/send",
  NOTIFICATION_STATS: "/notifications/stats",
  NOTIFICATION_BY_ID: (id: string) => `/notifications/${id}`,
  NOTIFICATION_RETRY: (id: string) => `/notifications/${id}/retry`,
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATION_READ_ALL: "/notifications/read-all",
  PUSH_NOTI_SYS_TO_ALL: "/notification/push-all",
  PUSH_NOTI_TO_USER: "/notification/push-to-user",
  PUSH_NOTI_TO_USERS: "/notification/push-to-users",

  // Accounts
  ACCOUNTS: "/accounts",
  ACCOUNTS_SEARCH: "/accounts/search",
  ACCOUNT_BY_NUMBER_ID: (id: string) => `/accounts/number/${id}`,
  ACCOUNT_BY_ID: (id: string) => `/accounts/${id}`,
  ACCOUNT_LOCK: (accountId: string) => `/accounts/${accountId}/lock`,
  ACCOUNT_UNLOCK: (accountId: string) => `/accounts/${accountId}/unlock`,

  // Transactions
  TRANSACTIONS: "/transactions",
  TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,

  // Loans
  LOANS: "/loans",
  LOAN_BY_ID: (id: string) => `/loans/${id}`,

  // Tickets
  TICKETS: "/tickets",
  TICKET_BY_ID: (id: string) => `/tickets/${id}`,

  // Dashboard
  DASHBOARD_STATS: "/dashboard/stats",

  // Admin Staff
  ADMINS: "/admins",
  ADMIN_BY_ID: (id: string) => `/admins/${id}`,
  ADMIN_RESET_PASSWORD: (id: string) => `/admins/${id}/reset-password`,
  ADMIN_CHANGE_PASSWORD: "/admins/change-password",

  // File Upload
  UPLOAD: "/upload",
  UPLOAD_MULTIPLE: "/upload/multiple",
  UPLOAD_AVATAR: "/upload/avatar",

  // Custom endpoints
  CUSTOM_ENDPOINT: "/custom-endpoint",
} as const;

// Full API URLs (for backward compatibility and direct usage)
export const API_ENDPOINTS = {
  // Base URLs
  ADMIN_BASE: URL_ADMIN,

  // Authentication
  AUTH_LOGIN: `${URL_ADMIN}${ENDPOINTS.AUTH_LOGIN}`,
  AUTH_REFRESH: `${URL_ADMIN}${ENDPOINTS.AUTH_REFRESH}`,
  AUTH_LOGOUT: `${URL_ADMIN}${ENDPOINTS.AUTH_LOGOUT}`,
  AUTH_REGISTER: `${URL_ADMIN}${ENDPOINTS.AUTH_REGISTER}`,

  // Users
  USERS: `${URL_ADMIN}${ENDPOINTS.USERS}`,
  USER_PROFILE: `${URL_ADMIN}${ENDPOINTS.USER_PROFILE}`,

  // Notifications
  NOTIFICATIONS: `${URL_ADMIN}${ENDPOINTS.NOTIFICATIONS}`,
  NOTIFICATION_HISTORY: `${URL_ADMIN}${ENDPOINTS.NOTIFICATION_HISTORY}`,
  NOTIFICATION_SEARCH: `${URL_ADMIN}${ENDPOINTS.NOTIFICATION_SEARCH}`,
  NOTIFICATION_SEND: `${URL_ADMIN}${ENDPOINTS.NOTIFICATION_SEND}`,
  NOTIFICATION_STATS: `${URL_ADMIN}${ENDPOINTS.NOTIFICATION_STATS}`,
  PUSH_NOTI_SYS_TO_ALL: `${URL_ADMIN}${ENDPOINTS.PUSH_NOTI_SYS_TO_ALL}`,
  PUSH_NOTI_TO_USER: `${URL_ADMIN}${ENDPOINTS.PUSH_NOTI_TO_USER}`,
  PUSH_NOTI_TO_USERS: `${URL_ADMIN}${ENDPOINTS.PUSH_NOTI_TO_USERS}`,

  // Accounts
  ACCOUNTS: `${URL_ADMIN}${ENDPOINTS.ACCOUNTS}`,
  ACCOUNTS_SEARCH: `${URL_ADMIN}${ENDPOINTS.ACCOUNTS_SEARCH}`,

  // Transactions
  TRANSACTIONS: `${URL_ADMIN}${ENDPOINTS.TRANSACTIONS}`,

  // Loans
  LOANS: `${URL_ADMIN}${ENDPOINTS.LOANS}`,

  // Tickets
  TICKETS: `${URL_ADMIN}${ENDPOINTS.TICKETS}`,

  // Dashboard
  DASHBOARD_STATS: `${URL_ADMIN}${ENDPOINTS.DASHBOARD_STATS}`,

  // Admin Staff
  ADMINS: `${URL_ADMIN}${ENDPOINTS.ADMINS}`,

  // File Upload
  UPLOAD: `${URL_ADMIN}${ENDPOINTS.UPLOAD}`,
  UPLOAD_MULTIPLE: `${URL_ADMIN}${ENDPOINTS.UPLOAD_MULTIPLE}`,
  UPLOAD_AVATAR: `${URL_ADMIN}${ENDPOINTS.UPLOAD_AVATAR}`,
} as const;

// Legacy export for backward compatibility
export const api = {
  PUSH_NOTI_SYS_TO_ALL: API_ENDPOINTS.PUSH_NOTI_SYS_TO_ALL,
  // GET_ALL_USER endpoint returns wrapped response: { success: boolean, message: string, data: User[] }
  GET_ALL_USER: URL_ADMIN + "/users",
};
