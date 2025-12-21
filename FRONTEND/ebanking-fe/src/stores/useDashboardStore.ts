import { create } from "zustand";
import { getAllUsersAsSimple } from "@/services/userService";
import { getEnrichedAccounts } from "@/services/accountService";
import { getTransactions } from "@/services/transactionService";
import { listHistory } from "@/services/notificationService";
import type { SimpleUser } from "@/services/userService";
import type { NotificationHistoryDto } from "@/services/notificationService";
import type { EnrichedAccount } from "@/services/accountService";
import type { Transaction } from "@/services/transactionService";

// Dashboard stats từ dữ liệu thật
export interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalTransactionsToday: number;
  totalAmount: number;
  totalAmountToday: number;
  lockedAccounts: number;
  failedTransactions: number;
  pendingTransactions: number;
  suspiciousTransactions: number;
  successfulTransactions: number;
  accountTypeDistribution: { type: string; count: number }[];
}

interface DashboardStore {
  // State
  stats: DashboardStats | null;
  users: SimpleUser[];
  accounts: EnrichedAccount[];
  transactions: Transaction[];
  recentNotifications: NotificationHistoryDto[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  loadDashboardData: () => Promise<void>;
  clearError: () => void;
  
  // Computed getters
  getSuccessRate: () => number;
  getLockRate: () => number;
  getTransactionsPerUser: () => number;
  getAccountsPerUser: () => number;
}

// Tính toán stats từ dữ liệu thật
const calculateStats = (
  users: SimpleUser[], 
  accounts: EnrichedAccount[], 
  transactions: Transaction[]
): DashboardStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Đếm accounts theo status
  const lockedAccounts = accounts.filter(acc => acc.status === 'Locked').length;
  
  // Đếm transactions theo status - sử dụng các status thật từ hệ thống
  const failedTransactions = transactions.filter(tx => 
    tx.status === 'FAILED' || tx.status === 'Failed' || tx.status === 'failed'
  ).length;
  const pendingTransactions = transactions.filter(tx => 
    tx.status === 'PENDING' || tx.status === 'Pending' || tx.status === 'pending'
  ).length;
  const suspiciousTransactions = transactions.filter(tx => 
    tx.status === 'SUSPICIOUS' || tx.status === 'Suspicious' || tx.status === 'suspicious'
  ).length;
  const successfulTransactions = transactions.filter(tx => 
    tx.status === 'SUCCESS' || tx.status === 'Success' || tx.status === 'success' || tx.status === 'COMPLETED'
  ).length;
  
  // Tính tổng số tiền
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Transactions hôm nay
  const todayTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.transactionAt);
    return txDate >= today;
  });
  const totalTransactionsToday = todayTransactions.length;
  const totalAmountToday = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Phân bố loại tài khoản
  const typeCount: Record<string, number> = {};
  accounts.forEach(acc => {
    const type = acc.type === 'Saving' ? 'Tiết kiệm' : 
                 acc.type === 'Current' ? 'Thanh toán' : 
                 acc.type;
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  const accountTypeDistribution = Object.entries(typeCount).map(([type, count]) => ({
    type,
    count
  }));
  
  return {
    totalUsers: users.length,
    totalAccounts: accounts.length,
    totalTransactions: transactions.length,
    totalTransactionsToday,
    totalAmount,
    totalAmountToday,
    lockedAccounts,
    failedTransactions,
    pendingTransactions,
    suspiciousTransactions,
    successfulTransactions,
    accountTypeDistribution,
  };
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  stats: null,
  users: [],
  accounts: [],
  transactions: [],
  recentNotifications: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Dashboard: Loading all data...');
      
      // Load users, accounts, and notifications from APIs
      const [users, accounts, notificationsResult] = await Promise.all([
        getAllUsersAsSimple(),
        getEnrichedAccounts({}),
        listHistory({ index: 0, limit: 5 })
      ]);
      
      // Load transactions from JSON data (fallback if API not ready)
      let transactions: Transaction[] = [];
      try {
        // Try to load from API first
        const transactionsResult = await getTransactions({ page: 1, limit: 1000 });
        transactions = transactionsResult.content;
      } catch (error) {
        console.warn('Dashboard: Transaction API not available, using mock data');
        // Load from JSON file as fallback
        const transactionsData = await import('@/data/transactions.json');
        transactions = transactionsData.transactions.map(tx => ({
          transactionId: tx.id,
          senderAccountNumber: tx.fromAccount,
          receiverAccountNumber: tx.toAccount,
          amount: tx.amount,
          currency: tx.currency,
          transactionType: tx.type,
          description: tx.description,
          status: tx.status,
          transactionAt: tx.timestamp,
        }));
      }
      
      console.log('Dashboard: Data loaded:', {
        users: users.length,
        accounts: accounts.length,
        transactions: transactions.length,
        notifications: notificationsResult.content.length
      });
      
      // Calculate stats from real data
      const stats = calculateStats(users, accounts, transactions);
      
      set({ 
        users,
        accounts,
        transactions,
        recentNotifications: notificationsResult.content,
        stats,
        lastUpdated: new Date(), 
        loading: false 
      });
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      set({ 
        error: error.message || 'Không thể tải dữ liệu dashboard',
        loading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed getters
  getSuccessRate: () => {
    const { stats } = get();
    if (!stats || stats.totalTransactions === 0) return 0;
    return (stats.successfulTransactions / stats.totalTransactions) * 100;
  },

  getLockRate: () => {
    const { stats } = get();
    if (!stats || stats.totalAccounts === 0) return 0;
    return (stats.lockedAccounts / stats.totalAccounts) * 100;
  },

  getTransactionsPerUser: () => {
    const { stats } = get();
    if (!stats || stats.totalUsers === 0) return 0;
    return stats.totalTransactions / stats.totalUsers;
  },

  getAccountsPerUser: () => {
    const { stats } = get();
    if (!stats || stats.totalUsers === 0) return 0;
    return stats.totalAccounts / stats.totalUsers;
  },
}));