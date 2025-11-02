import { store } from "../store";
import { navigate } from "../navigation/navigate";

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

function getAuthToken(): string | null {
  const state = store.getState();
  return state.app.loginResponse?.jwt || null;
}

async function post(url: string, body: any, authRequire: boolean = true) {
  console.log("POST request to:", url);
  console.log("Request body:", body);

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
        navigate('SignIn' as never);
      }

      throw new Error(errorMessage);
    }

    if (rawText) {
      try {
        const data = JSON.parse(rawText);
        console.log("Response data:", data);
        return data;
      } catch {
        console.warn("Response is not valid JSON:", rawText);
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
    throw error;
  }
}



async function get(url: string, params: any = {}, authRequire: boolean = false) {
  const headers = { ...defaultHeaders };

  if (authRequire) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(response)
    throw new Error(`GET ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

export default {
  post,
  get,
};
