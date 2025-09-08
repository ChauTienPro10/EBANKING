// Data interfaces for the application
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Account {
    id: string;
    accountNumber: string;
    accountName: string;
    availableBalance: number;
    ledgerBalance: number;
    pendingBalance: number;
    currency: string;
    cardType: 'primary' | 'savings' | 'credit';
}

export interface QuickAction {
    id: string;
    title: string;
    icon: string;
    color: string;
    tag?: string;
    route?: string;
}

export interface Service {
    id: string;
    title: string;
    icon: string;
    color: string;
    route?: string;
}

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    route: string;
    category: string;
}

export interface SupportOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

export interface SearchResult {
    id: string;
    title: string;
    category: string;
    description?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface TransferTransaction {
    id: string;
    recipientAccount: string;
    amount: number;
    content: string;
    transferType: 'internal' | 'external';
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
    fee?: number;
}

export interface AppState {
    user: User | null;
    accounts: Account[];
    notifications: Notification[];
    isAuthenticated: boolean;
    currentLanguage: string;
}

// Service interfaces
export interface DataService {
    getUser(): Promise<User>;
    getAccounts(): Promise<Account[]>;
    getQuickActions(): Promise<QuickAction[]>;
    getServices(): Promise<Service[]>;
    getMenuItems(): Promise<MenuItem[]>;
    getSupportOptions(): Promise<SupportOption[]>;
    search(query: string): Promise<SearchResult[]>;
    getNotifications(): Promise<Notification[]>;
    authenticate(pin: string): Promise<boolean>;
    logout(): Promise<void>;
}
