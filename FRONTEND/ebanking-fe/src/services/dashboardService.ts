import apiClient from './api';
import { ENDPOINTS } from './URL';

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
  dailyTransactionCounts: { date: string; count: number }[];
  accountTypeDistribution: { type: string; count: number }[];
}

export const getDashboardStats = () => {
  return apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD_STATS);
};

