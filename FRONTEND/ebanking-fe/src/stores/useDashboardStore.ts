import { create } from "zustand";
import { getEnhancedDashboardData } from "@/services/dashboardService";
import type { DashboardStats } from "@/services/dashboardService";
import type { NotificationHistoryDto } from "@/services/notificationService";

interface DashboardStore {
  // State
  stats: DashboardStats | null;
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

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  stats: null,
  recentNotifications: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Dashboard: Loading stats from backend API...');

      const dashboardData = await getEnhancedDashboardData();

      console.log('Dashboard: Data loaded from backend:', dashboardData.stats);

      set({
        stats: dashboardData.stats,
        recentNotifications: dashboardData.recentNotifications,
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