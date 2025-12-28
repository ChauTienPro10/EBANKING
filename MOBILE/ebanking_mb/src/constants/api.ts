export const HOST_SERVER = '192.168.1.5';

export const BASE_URL = `http://${HOST_SERVER}:8000/`;
export const FCM_SERVICE = `http://${HOST_SERVER}:8004/`;
export const AUTH_SERVICE = BASE_URL + 'authService';
export const ANALYSIS_URL = AUTH_SERVICE + '/analytics';
// Call UserService directly (port 8001) to get full UserInfo with eKYC data
export const USER_SERVICE_DIRECT = `http://${HOST_SERVER}:8001`;
// Call ekycService directly (port 8008) for eKYC session details
export const EKYC_SERVICE_DIRECT = `http://${HOST_SERVER}:8008`;
export const FCM_CONTROLLER_URL = `${BASE_URL}authService/fcm`;
export const API = {
  LOGIN: `${AUTH_SERVICE}/auth/login`,
  REGISTER: `${AUTH_SERVICE}/auth/register`,
  REGISTER_VERIFY_OTP: `${AUTH_SERVICE}/auth/register-verify-otp`,
  GET_ACCOUNT_TRANS_INFO: `${AUTH_SERVICE}/trans/account/info/`,
  GET_USER_INFO: `${AUTH_SERVICE}/auth/user/{userId}`,
  // Direct call to UserService (bypass API Gateway) to get eKYC data
  GET_USER_INFO_FULL: `${USER_SERVICE_DIRECT}/user/{userId}/info`,
  UPDATE_USER_INFO: `${AUTH_SERVICE}/auth/update`,
  OPEN_ACCOUNT_TRANSACTION: `${AUTH_SERVICE}/trans/account/new`,
  CHECK_ACCOUNT_NUMBER: `${AUTH_SERVICE}/trans/account/checkAccountNumber`,
  CHECK_AND_CREATE_TRANSACTION: `${AUTH_SERVICE}/trans/account/createTransaction`,
  TRANSFER: `${AUTH_SERVICE}/transaction/transfer`,
  GET_TRANSFER_HISTORY: `${AUTH_SERVICE}/transaction/history`,
  FORGOT_PASS_REQUEST_OTP: `${AUTH_SERVICE}/auth/forgot-password-send-otp`,
  FORGOT_PASS_SEND_OTP: `${AUTH_SERVICE}/auth/forgot-password-verify-otp`,

  // fcm
  SAVE_TOKEN_FCM: `${AUTH_SERVICE}/fcm/save-token`,
  UPDATE_TOKEN_FCM: `${AUTH_SERVICE}/fcm/updateFcmToken`,

  //Pin
  SET_PIN: `${AUTH_SERVICE}/pin-code/new`,
  GET_PIN_STT: `${AUTH_SERVICE}/pin-code/{username}`,
  DELETE_PIN: `${AUTH_SERVICE}/pin-code/delete`,
  CHECK_PIN: `${AUTH_SERVICE}/pin-code/verify-pincode`,

  // chat
  ASK: `${BASE_URL}chatService/ask`,

  // notify
  GET_NOTIFICATIONSYSTEM: `${FCM_CONTROLLER_URL}/getSysNoti`,
  GET_NOTIFICATIONPERSONAL: `${FCM_CONTROLLER_URL}/getPerNoti`,
  GET_TRANS_NOTIFICATION: `${FCM_CONTROLLER_URL}/getTransferNoti`,
  SEEN_NOTIFICATION: `${FCM_CONTROLLER_URL}/seenNoti`,

  // avatar
  UPLOAD_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,
  DELETE_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,
  GET_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,

  // face auth
  CHECK_FACE_AUTH_REQUIRED: `${AUTH_SERVICE}/ekyc/check-face-auth`,
  VERIFY_TRANSACTION_FACE_AUTH: `${AUTH_SERVICE}/ekyc/verify-transaction`,

  // transaction limits
  GET_USER_LIMITS: `${AUTH_SERVICE}/trans/transaction-limits`,
  UPDATE_USER_LIMITS: `${AUTH_SERVICE}/trans/transaction-limits`,

  // ket qua xo so
  GET_XOSO_MIENBAC: `${AUTH_SERVICE}/xoso/mb`,
  GET_XOSO_MIENTRUNG: `${AUTH_SERVICE}/xoso/mt`,
  GET_XOSO_MIENNAM: `${AUTH_SERVICE}/xoso/mn`,

  // analysis

  ANALYSIS_GET_30DAYS: `${ANALYSIS_URL}/info`,
  ANALYSIS_GET_CURRENT_MONTH: `${ANALYSIS_URL}/current-month/{username}`,
  ANALYSIS_GET_PREVIOUS_MONTH: `${ANALYSIS_URL}/previous-month/{username}`,
  ANALYSIS_GET_CURRENT_WEEK: `${ANALYSIS_URL}/current-week/{username}`,
  ANALYSIS_GET_PREVIOUS_WEEK: `${ANALYSIS_URL}/previous-week/{username}`,
  ANALYSIS_GET_CUSTOM: `${ANALYSIS_URL}/custom/{username}`,

  // Lock account
  // LOCK_ACCOUNT: `${AUTH_SERVICE}/lock-account`,
  // LOCK_ACCOUNT_BY_ADMIN: `${AUTH_SERVICE}/lock-account/{username}`,
  // UNLOCK_ACCOUNT: `${AUTH_SERVICE}/unlock`,
  // CHECK_LOCK_ACCOUNT: `${AUTH_SERVICE}/check/{username}`,
  // GET_CURRENT_LOCK_ACCOUNT: `${AUTH_SERVICE}/current/{username}`,
  // GET_HISTORY_LOCK_ACCOUNT: `${AUTH_SERVICE}/history/{username}`,
  // GET_LOCKED_ACCOUNT: `${AUTH_SERVICE}/locked`,
  // GET_LOCKED_ACCOUNT_BY_ADMIN: `${AUTH_SERVICE}/locked-by/{adminUsername}`,
  SELF_LOCK_ACCOUNT: `${AUTH_SERVICE}/self-lock`,
  SELF_UNLOCK_ACCOUNT: `${AUTH_SERVICE}/self-unlock`,
  CAN_SELF_UNLOCK: `${AUTH_SERVICE}/can-self-unlock/{username}`,
  GET_LOCK_TYPE: `${AUTH_SERVICE}/lock-type/{username}`,

  // Savings Account APIs
  GET_INTEREST_RATES: `${AUTH_SERVICE}/interest-rates/active`,
  CREATE_SAVINGS_ACCOUNT: `${AUTH_SERVICE}/savings-accounts`,
  GET_SAVINGS_ACCOUNTS: `${AUTH_SERVICE}/savings-accounts/user/{userId}`,
  GET_SAVINGS_ACCOUNT_DETAIL: `${AUTH_SERVICE}/savings-accounts/account/{accountNumber}`,
  TRANSFER_TO_SAVINGS: `${AUTH_SERVICE}/savings-transfers/payment-to-savings`,
  TRANSFER_FROM_SAVINGS: `${AUTH_SERVICE}/savings-transfers/savings-to-payment`,
  CREATE_SAVINGS_REQUEST: `${AUTH_SERVICE}/transaction-requests/cash`,
  GET_SAVINGS_REQUESTS: `${AUTH_SERVICE}/transaction-requests/user/{userId}`,
  GET_SAVINGS_REQUEST_DETAIL: `${AUTH_SERVICE}/transaction-requests/{requestId}`,
  CANCEL_SAVINGS_REQUEST: `${AUTH_SERVICE}/transaction-requests/{requestId}/cancel`,

  // Phone Top-up APIs
  GET_PHONE_TOPUP_PROVIDERS: `${AUTH_SERVICE}/phone-topup/providers`,
  PHONE_TOPUP: `${AUTH_SERVICE}/phone-topup`,
  PHONE_TOPUP_VERIFY_FACE_AUTH: `${AUTH_SERVICE}/phone-topup/verify-face-auth/{faceAuthSessionId}`,
  GET_PHONE_TOPUP_HISTORY: `${AUTH_SERVICE}/phone-topup/history/{userId}`,
  GET_PHONE_TOPUP_TRANSACTION: `${AUTH_SERVICE}/phone-topup/transaction/{transactionId}`,

  // Data 4G APIs
  GET_DATA_PACKAGES: `${AUTH_SERVICE}/data-topup/packages`,
  GET_DATA_PACKAGES_BY_PROVIDER: `${AUTH_SERVICE}/data-topup/packages/provider/{providerId}`,
  GET_DATA_PACKAGES_BY_PROVIDER_CODE: `${AUTH_SERVICE}/data-topup/packages/provider-code/{providerCode}`,
  GET_DATA_PACKAGE_BY_ID: `${AUTH_SERVICE}/data-topup/packages/{packageId}`,
  GET_DATA_PACKAGE_BY_CODE: `${AUTH_SERVICE}/data-topup/packages/code/{packageCode}`,
  GET_DATA_PACKAGES_BY_PRICE_RANGE: `${AUTH_SERVICE}/data-topup/packages/provider/{providerId}/price-range`,
  INITIATE_DATA_TOPUP: `${AUTH_SERVICE}/data-topup/initiate`,
  VERIFY_DATA_FACE_AUTH: `${AUTH_SERVICE}/data-topup/verify-face-auth`,
  GET_DATA_TRANSACTION: `${AUTH_SERVICE}/data-topup/transaction/{transactionId}`,
  GET_DATA_HISTORY: `${AUTH_SERVICE}/data-topup/history`,
  GET_DATA_HISTORY_PAGINATED: `${AUTH_SERVICE}/data-topup/history/paginated`,

  // Transfer Purpose APIs
  GET_TRANSFER_PURPOSES: `${AUTH_SERVICE}/transfer/purposes`,

  // Spending Category APIs (Direct call to TransactionService with URL parameters)
  TRANSACTION_SERVICE_DIRECT: `http://${HOST_SERVER}:8003`,
  GET_SPENDING_CATEGORIES: `http://${HOST_SERVER}:8003/api/categories/user/{userId}`,
  CREATE_SPENDING_CATEGORY: `http://${HOST_SERVER}:8003/api/categories/user/{userId}`,
  UPDATE_SPENDING_CATEGORY: `http://${HOST_SERVER}:8003/api/categories/user/{userId}/{categoryId}`,
  DELETE_SPENDING_CATEGORY: `http://${HOST_SERVER}:8003/api/categories/user/{userId}/{categoryId}`,
  INITIALIZE_CATEGORIES: `http://${HOST_SERVER}:8003/api/categories/user/{userId}/initialize`,
  GET_CATEGORY_STATISTICS: `http://${HOST_SERVER}:8003/api/categories/user/{userId}/statistics`,
};
