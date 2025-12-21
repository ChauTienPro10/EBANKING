import fetchClient from './fetch';
import type { ApiResponse } from './fetch';
import { ENDPOINTS } from './URL';
import { getRecentNotifications } from './notificationService';

// Corresponds to actual DashboardStatsResponse from backend
export interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalTransactionsToday: number;
  totalAmount: string;
  totalAmountToday: string;
  activeUsers: number;
  lockedAccounts: number;
  failedTransactions: number;
  pendingTransactions: number;
  suspiciousTransactions: number; // Add this field
  dailyTransactionCounts: { date: string; count: number }[];
  accountTypeDistribution: { type: string; count: number }[];
}

// Enhanced dashboard data with notifications
export interface EnhancedDashboardData {
  stats: DashboardStats;
  recentNotifications: Array<{
    id: number;
    title: string;
    content: string;
    type: string;
    time: string;
    isTransaction: boolean;
    amount?: string;
    username?: string;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response: ApiResponse<DashboardStats> = await fetchClient.get(
      ENDPOINTS.DASHBOARD_STATS
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error('Không thể tải thống kê dashboard');
  }
}

export async function getEnhancedDashboardData(): Promise<EnhancedDashboardData> {
  try {
    // Fetch both stats and recent notifications in parallel
    const [stats, recentNotifications] = await Promise.all([
      getDashboardStats(),
      getRecentNotifications(5)
    ]);
    
    return {
      stats,
      recentNotifications
    };
  } catch (error) {
    console.error('Failed to fetch enhanced dashboard data:', error);
    throw new Error('Không thể tải dữ liệu dashboard');
  }
}

