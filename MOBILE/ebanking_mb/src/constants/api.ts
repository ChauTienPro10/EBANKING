import { API_URL } from '@env';

export const BASE_URL = 'http://10.0.27.242:8000/';

export const AUTH_SERVICE = BASE_URL + 'authService';

export const API = {
  LOGIN: `${AUTH_SERVICE}/auth/login`,
  REGISTER: `${AUTH_SERVICE}/auth/register`,
  REGISTER_VERIFY_OTP: `${AUTH_SERVICE}/auth/register-verify-otp`,
  GET_ACCOUNT_TRANS_INFO: `${AUTH_SERVICE}/trans/account/info/`,
  GET_USER_INFO: `${AUTH_SERVICE}/auth/user/{userId}`,
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

};
