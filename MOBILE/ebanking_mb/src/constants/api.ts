import { API_URL } from '@env';

const BASE_URL = 'http://10.20.2.91:8000/';

const AUTH_SERVICE = BASE_URL + 'authService';

export const API = {
  LOGIN: `${AUTH_SERVICE}/auth/login`,
  REGISTER: `${AUTH_SERVICE}/auth/register`,
  REGISTER_VERIFY_OTP: `${AUTH_SERVICE}/auth/register-verify-otp`,
  GET_ACCOUNT_TRANS_INFO: `${AUTH_SERVICE}/trans/account/info/`,
  GET_USER_INFO: `${AUTH_SERVICE}/auth/user/{userId}`,
  UPDATE_USER_INFO: `${AUTH_SERVICE}/auth/update`,
  OPEN_ACCOUNT_TRANSACTION: `${AUTH_SERVICE}/trans/account/new`,
  CHECK_ACCOUNT_NUMBER: `${AUTH_SERVICE}/trans/account/checkAccountNumber`,
  TRANSFER: `${AUTH_SERVICE}/transaction/transfer`
};
