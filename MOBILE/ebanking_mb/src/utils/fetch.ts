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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`POST ${url} failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // đọc raw text trước
    const text = await response.text();

    if (text) {
      try {
        const data = JSON.parse(text); // parse nếu có nội dung
        console.log("Response data:", data);
        return data;
      } catch (e) {
        console.warn("Response is not valid JSON:", text);
        return text; // trả về raw text nếu không phải JSON
      }
    } else {
      console.log("Response is empty");
      throw new Error(`Empty response from server at`);
    }
  } catch (error: any) {
    console.error("Fetch error:", error);
    if (error.status === 403) {
      navigate('SignIn' as never)
    }
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
