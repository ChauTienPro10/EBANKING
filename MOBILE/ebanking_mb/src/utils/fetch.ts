import { store } from '../store';
import Toast from 'react-native-toast-message';

import { logout } from '../store/slices/appSlice';

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

function getAuthToken(): string | null {
  const state = store.getState();
  return state.app.loginResponse?.jwt || null;
}

async function post(url: string, body: any, authRequire: boolean = true) {
  console.log('POST request to:', url);
  console.log('Request body:', body);

  const headers = { ...defaultHeaders };

  if (authRequire) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const rawText = await response.text();

    if (!response.ok) {
      let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(rawText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Không phải JSON, giữ nguyên rawText
        errorMessage = rawText || errorMessage;
      }

      // Ghi log lỗi gọn gàng
      console.error('Fetch error:', errorMessage);

      // Có thể xử lý điều hướng nếu cần
      if (response.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Thông báo',
          text2: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        });
        store.dispatch(logout());
      }

      throw new Error(errorMessage);
    }

    if (rawText) {
      try {
        const data = JSON.parse(rawText);
        console.log('Response data:', data);
        return data;
      } catch {
        console.warn('Response is not valid JSON:', rawText);
        return rawText;
      }
    } else {
      throw new Error('Phản hồi từ máy chủ trống');
    }
  } catch (error: any) {
    const message =
      typeof error?.message === 'string'
        ? error.message.replace('INTERNAL: ', '')
        : 'Lỗi không xác định';

    console.error('Lỗi khi gửi yêu cầu:', message);
    if (message === '403' || message === 403) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
      store.dispatch(logout());
    }
    throw error;
  }
}

async function get(
  url: string,
  params: any = {},
  authRequire: boolean = false,
) {
  console.log('GET request to:', url);

  const headers = { ...defaultHeaders };

  if (authRequire) {
    const token = getAuthToken();
    console.log('Auth token present:', !!token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Auth required but no token available');
    }
  }

  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    const rawText = await response.text();

    if (!response.ok) {
      let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(rawText);
        if (errorJson.message || errorJson.error) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch {
        errorMessage = rawText || errorMessage;
      }

      console.error('GET error:', errorMessage);

      // Handle 403 errors by navigating to SignIn
      if (response.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Thông báo',
          text2: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        });
        store.dispatch(logout());
      }

      throw new Error(errorMessage);
    }

    if (rawText) {
      try {
        const data = JSON.parse(rawText);
        console.log('Response data:', data);
        return data;
      } catch {
        console.warn('Response is not valid JSON:', rawText);
        return rawText;
      }
    } else {
      throw new Error('Phản hồi từ máy chủ trống');
    }
  } catch (error: any) {
    const message =
      typeof error?.message === 'string'
        ? error.message.replace('INTERNAL: ', '')
        : 'Lỗi không xác định';

    console.error('Lỗi khi gửi yêu cầu GET:', message);
    throw error;
  }
}

async function put(url: string, body: any, authRequire: boolean = true) {
  console.log('PUT request to:', url);
  console.log('Request body:', body);

  const headers = { ...defaultHeaders };

  if (authRequire) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const rawText = await response.text();

    if (!response.ok) {
      let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(rawText);
        if (errorJson.message || errorJson.error) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch {
        errorMessage = rawText || errorMessage;
      }

      console.error('PUT error:', errorMessage);

      if (response.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Thông báo',
          text2: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        });
        store.dispatch(logout());
      }

      throw new Error(errorMessage);
    }

    if (rawText) {
      try {
        const data = JSON.parse(rawText);
        console.log('PUT Response data:', data);
        return data;
      } catch {
        console.warn('PUT Response is not valid JSON:', rawText);
        return rawText;
      }
    } else {
      throw new Error('Phản hồi từ máy chủ trống');
    }
  } catch (error: any) {
    const message =
      typeof error?.message === 'string'
        ? error.message.replace('INTERNAL: ', '')
        : 'Lỗi không xác định';

    console.error('Lỗi khi gửi yêu cầu PUT:', message);
    if (message === '403' || message === 403) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
      store.dispatch(logout());
    }
    throw error;
  }
}

export default {
  post,
  get,
  put,
};
