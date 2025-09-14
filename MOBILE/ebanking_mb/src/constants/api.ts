import { API_URL } from '@env';

const BASE_URL = `${API_URL}/authService`;

export const API = {
  LOGIN: `http://10.0.5.154:8000/authService/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
};
