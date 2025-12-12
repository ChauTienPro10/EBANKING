import { API_URL } from '@env';

export const HOST_SERVER = '192.168.1.4';

export const BASE_URL = `http://${HOST_SERVER}:8000/`;
export const FCM_SERVICE = `http://${HOST_SERVER}:8004/`;
export const AUTH_SERVICE = BASE_URL + 'authService';
// Call UserService directly (port 8001) to get full UserInfo with eKYC data
export const USER_SERVICE_DIRECT = `http://${HOST_SERVER}:8001`;

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
  GET_NOTIFICATIONSYSTEM: `${FCM_SERVICE}notify/getSysNoti`,
  GET_NOTIFICATIONPERSONAL: `${FCM_SERVICE}notify/getPerNoti`,

  // avatar
  UPLOAD_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,
  DELETE_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,
  GET_AVATAR: `${AUTH_SERVICE}/auth/user/{userId}/avatar`,

  // face auth
  CHECK_FACE_AUTH_REQUIRED: `${AUTH_SERVICE}/ekyc/check-face-auth`,
  VERIFY_TRANSACTION_FACE_AUTH: `${AUTH_SERVICE}/ekyc/verify-transaction`,
};
