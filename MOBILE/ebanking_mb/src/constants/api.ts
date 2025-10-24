import { API_URL } from '@env';

const BASE_URL = 'http://192.168.1.9:8000';

const AUTH_SERVICE = 'http://192.168.1.9:8000/authService';


export const API = {
  LOGIN: `${AUTH_SERVICE}/auth/login`,
  REGISTER: `${AUTH_SERVICE}/auth/register`,
  REGISTER_VERIFY_OTP: `${AUTH_SERVICE}/auth/register-verify-otp`,
  GET_ACCOUNT_TRANS_INFO: `${AUTH_SERVICE}/trans/account/info/`
};
