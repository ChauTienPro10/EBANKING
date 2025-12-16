import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for refresh to avoid interceptor loops
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void; config: AxiosRequestConfig }>= [];

function setAuthHeader(config: AxiosRequestConfig) {
  const token = localStorage.getItem('authToken');
  if (!config.headers) config.headers = {};
  if (token) (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';
    const pathname = url.startsWith('http') ? new URL(url).pathname : url;
    const isAuthEndpoint = /\/auth\/(login|refresh)$/.test(pathname);
    if (!isAuthEndpoint) {
      setAuthHeader(config);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function doRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const res = await refreshClient.post('/auth/refresh', { refreshToken });
  const { jwt, refreshToken: newRefresh } = res.data;
  if (!jwt || !newRefresh) throw new Error('Invalid refresh response');
  localStorage.setItem('authToken', jwt);
  localStorage.setItem('refreshToken', newRefresh);
}

// Response interceptor to handle 401 and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Do not try refresh on auth endpoints
    const isAuthEndpoint = (original.url || '').includes('/auth/login') || (original.url || '').includes('/auth/refresh');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await doRefresh();
          isRefreshing = false;
          // retry all queued requests
          pendingQueue.forEach(({ resolve }) => resolve(undefined));
          pendingQueue = [];
          setAuthHeader(original);
          return apiClient(original);
        } catch (e) {
          isRefreshing = false;
          pendingQueue.forEach(({ reject }) => reject(e));
          pendingQueue = [];
          // logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          return Promise.reject(e);
        }
      }

      // queue request until refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: original });
      }).then(() => {
        setAuthHeader(original);
        return apiClient(original);
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

