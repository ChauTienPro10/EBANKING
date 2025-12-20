interface FetchConfig extends RequestInit {
    timeout?: number;
    retry?: number;
    retryDelay?: number;
}

interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

interface ApiError extends Error {
    status?: number;
    statusText?: string;
    data?: any;
}

class CustomFetch {
    private baseURL: string;
    private defaultConfig: FetchConfig;
    private isRefreshing = false;
    private pendingQueue: Array<{
        resolve: (value: any) => void;
        reject: (reason: any) => void;
        url: string;
        config: FetchConfig;
    }> = [];

    constructor(baseURL?: string, defaultConfig: FetchConfig = {}) {
        // Import BASE_URLS from URL.ts to avoid circular dependency
        const defaultBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7999';
        this.baseURL = baseURL || defaultBaseURL;
        this.defaultConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
            retry: 3,
            retryDelay: 1000,
            ...defaultConfig,
        };
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    private setTokens(authToken: string, refreshToken: string): void {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    private clearTokens(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    private isAuthEndpoint(url: string): boolean {
        // Check if URL contains auth endpoints
        return url.includes('/auth/login') || url.includes('/auth/refresh');
    }

    private buildURL(url: string): string {
        if (url.startsWith('http')) {
            return url;
        }
        return `${this.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }

    private buildHeaders(config: FetchConfig, url: string, includeAuth = true): HeadersInit {
        const headers: Record<string, string> = {
            ...this.defaultConfig.headers,
            ...config.headers,
        } as Record<string, string>;

        if (includeAuth && !this.isAuthEndpoint(url)) {
            const token = this.getAuthToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async fetchWithTimeout(
        url: string,
        config: FetchConfig
    ): Promise<Response> {
        const { timeout = this.defaultConfig.timeout } = config;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private async refreshTokens(): Promise<void> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const refreshURL = this.buildURL('/auth/refresh');
        const response = await this.fetchWithTimeout(refreshURL, {
            method: 'POST',
            headers: this.buildHeaders({}, '/auth/refresh', false),
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        const { jwt, refreshToken: newRefreshToken } = data;

        if (!jwt || !newRefreshToken) {
            throw new Error('Invalid refresh response');
        }

        this.setTokens(jwt, newRefreshToken);
    }

    private async handleUnauthorized(
        url: string,
        config: FetchConfig
    ): Promise<ApiResponse> {
        if (this.isAuthEndpoint(url)) {
            throw this.createError('Unauthorized', 401, 'Unauthorized');
        }

        if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
                await this.refreshTokens();
                this.isRefreshing = false;

                // Retry all queued requests
                const queuedRequests = [...this.pendingQueue];
                this.pendingQueue = [];

                queuedRequests.forEach(({ resolve, url, config }) => {
                    this.request(url, config).then(resolve).catch(reject => reject);
                });

                // Retry the original request
                return this.request(url, config);
            } catch (error) {
                this.isRefreshing = false;

                // Reject all queued requests
                const queuedRequests = [...this.pendingQueue];
                this.pendingQueue = [];

                queuedRequests.forEach(({ reject }) => reject(error));

                // Clear tokens and redirect to login
                this.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }

                throw error;
            }
        }

        // Queue the request if refresh is in progress
        return new Promise((resolve, reject) => {
            this.pendingQueue.push({ resolve, reject, url, config });
        });
    }

    private createError(message: string, status?: number, statusText?: string, data?: any): ApiError {
        const error = new Error(message) as ApiError;
        error.status = status;
        error.statusText = statusText;
        error.data = data;
        return error;
    }

    private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
        let data: T;

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = (await response.text()) as unknown as T;
        }

        return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }

    async request<T = any>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        const fullURL = this.buildURL(url);
        const headers = this.buildHeaders(config, url);

        const requestConfig: FetchConfig = {
            ...this.defaultConfig,
            ...config,
            headers,
        };

        const { retry = this.defaultConfig.retry, retryDelay = this.defaultConfig.retryDelay } = requestConfig;
        let lastError: Error;

        for (let attempt = 0; attempt <= retry!; attempt++) {
            try {
                const response = await this.fetchWithTimeout(fullURL, requestConfig);

                if (response.status === 401) {
                    return this.handleUnauthorized(url, config);
                }

                if (!response.ok) {
                    const errorData = await this.parseResponse(response);
                    throw this.createError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        response.statusText,
                        errorData.data
                    );
                }

                return this.parseResponse<T>(response);
            } catch (error: any) {
                lastError = error as Error;

                if (attempt < retry! && !error.name?.includes('AbortError')) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay! * (attempt + 1)));
                    continue;
                }

                throw error;
            }
        }

        throw lastError!;
    }

    // HTTP Methods
    async get<T = any>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        return this.request<T>(url, { ...config, method: 'GET' });
    }

    async post<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        return this.request<T>(url, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        return this.request<T>(url, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        return this.request<T>(url, {
            ...config,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        return this.request<T>(url, { ...config, method: 'DELETE' });
    }

    // Upload file method
    async upload<T = any>(url: string, formData: FormData, config: FetchConfig = {}): Promise<ApiResponse<T>> {
        const uploadConfig = { ...config };

        // Remove Content-Type header to let browser set it with boundary for FormData
        if (uploadConfig.headers) {
            const headers = { ...uploadConfig.headers } as Record<string, string>;
            delete headers['Content-Type'];
            uploadConfig.headers = headers;
        }

        return this.request<T>(url, {
            ...uploadConfig,
            method: 'POST',
            body: formData,
        });
    }
}

// Create default instance
const fetchClient = new CustomFetch();

export default fetchClient;
export { CustomFetch };
export type { FetchConfig, ApiResponse, ApiError };