import { DataService, User, Account, QuickAction, Service, MenuItem, SupportOption, SearchResult, Notification } from '../types/data';

export class APIService implements DataService {
    private baseURL: string;
    private apiKey: string;

    constructor(baseURL: string, apiKey: string) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getUser(): Promise<User> {
        return this.request<User>('/api/user/profile');
    }

    async getAccounts(): Promise<Account[]> {
        return this.request<Account[]>('/api/accounts');
    }

    async getQuickActions(): Promise<QuickAction[]> {
        return this.request<QuickAction[]>('/api/quick-actions');
    }

    async getServices(): Promise<Service[]> {
        return this.request<Service[]>('/api/services');
    }

    async getMenuItems(): Promise<MenuItem[]> {
        return this.request<MenuItem[]>('/api/menu-items');
    }

    async getSupportOptions(): Promise<SupportOption[]> {
        return this.request<SupportOption[]>('/api/support-options');
    }

    async search(query: string): Promise<SearchResult[]> {
        return this.request<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`);
    }

    async getNotifications(): Promise<Notification[]> {
        return this.request<Notification[]>('/api/notifications');
    }

    async authenticate(pin: string): Promise<boolean> {
        const result = await this.request<{ success: boolean }>('/api/auth/verify-pin', {
            method: 'POST',
            body: JSON.stringify({ pin }),
        });
        return result.success;
    }

    async logout(): Promise<void> {
        await this.request('/api/auth/logout', {
            method: 'POST',
        });
    }
}

export const createDataService = (): DataService => {
    const isDevelopment = __DEV__;

    if (isDevelopment) {
        const { MockDataService } = require('./MockDataService');
        return new MockDataService();
    } else {
        const baseURL = 'https://api.ebanking.com';
        const apiKey = '';
        return new APIService(baseURL, apiKey);
    }
};
