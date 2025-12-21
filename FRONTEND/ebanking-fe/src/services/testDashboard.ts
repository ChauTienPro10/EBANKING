/**
 * Test file for dashboard functionality
 */

import { 
  getDashboardStats, 
  getEnhancedDashboardData,
  type DashboardStats
} from './dashboardService';

/**
 * Test basic dashboard stats
 */
export async function testDashboardStats() {
  try {
    console.log('Testing dashboard stats...');
    
    const stats = await getDashboardStats();
    console.log('Dashboard stats:', stats);
    
    // Validate required fields
    const requiredFields = [
      'totalUsers', 'totalAccounts', 'totalTransactions', 
      'totalTransactionsToday', 'activeUsers', 'lockedAccounts'
    ];
    
    const missingFields = requiredFields.filter(field => 
      stats[field as keyof DashboardStats] === undefined
    );
    
    if (missingFields.length > 0) {
      console.warn('Missing fields in dashboard stats:', missingFields);
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to test dashboard stats:', error);
    throw error;
  }
}

/**
 * Test enhanced dashboard data (stats + notifications)
 */
export async function testEnhancedDashboard() {
  try {
    console.log('Testing enhanced dashboard data...');
    
    const data = await getEnhancedDashboardData();
    console.log('Enhanced dashboard data:', data);
    
    console.log(`Stats loaded: ${!!data.stats}`);
    console.log(`Recent notifications: ${data.recentNotifications.length}`);
    
    if (data.recentNotifications.length > 0) {
      console.log('Sample notification:', data.recentNotifications[0]);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to test enhanced dashboard:', error);
    throw error;
  }
}

/**
 * Test dashboard metrics calculations
 */
export async function testDashboardMetrics() {
  try {
    console.log('Testing dashboard metrics calculations...');
    
    const stats = await getDashboardStats();
    
    // Calculate success rate
    const successRate = stats.totalTransactions > 0 
      ? ((stats.totalTransactions - (stats.failedTransactions || 0)) / stats.totalTransactions) * 100
      : 0;
    
    // Calculate activity rate
    const activityRate = stats.totalUsers > 0 
      ? (stats.activeUsers / stats.totalUsers) * 100
      : 0;
    
    // Calculate lock rate
    const lockRate = stats.totalAccounts > 0 
      ? (stats.lockedAccounts / stats.totalAccounts) * 100
      : 0;
    
    const metrics = {
      successRate: successRate.toFixed(1) + '%',
      activityRate: activityRate.toFixed(1) + '%',
      lockRate: lockRate.toFixed(1) + '%',
      transactionsPerUser: stats.totalUsers > 0 
        ? (stats.totalTransactions / stats.totalUsers).toFixed(1)
        : '0',
      accountsPerUser: stats.totalUsers > 0 
        ? (stats.totalAccounts / stats.totalUsers).toFixed(1)
        : '0'
    };
    
    console.log('Calculated metrics:', metrics);
    
    return { stats, metrics };
  } catch (error) {
    console.error('Failed to test dashboard metrics:', error);
    throw error;
  }
}

/**
 * Test dashboard charts data
 */
export async function testDashboardCharts() {
  try {
    console.log('Testing dashboard charts data...');
    
    const stats = await getDashboardStats();
    
    // Process daily transaction data
    const dailyTxData = stats.dailyTransactionCounts.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      formattedDate: new Date(item.date).toLocaleDateString("vi-VN")
    }));
    
    // Process account type distribution
    const accountTypeData = stats.accountTypeDistribution.map((item) => ({
      name: item.type,
      value: item.count,
      percentage: stats.totalAccounts > 0 
        ? ((item.count / stats.totalAccounts) * 100).toFixed(1) + '%'
        : '0%'
    }));
    
    console.log('Daily transactions chart data:', dailyTxData);
    console.log('Account types chart data:', accountTypeData);
    
    return {
      dailyTransactions: dailyTxData,
      accountTypes: accountTypeData
    };
  } catch (error) {
    console.error('Failed to test dashboard charts:', error);
    throw error;
  }
}

/**
 * Test dashboard performance
 */
export async function testDashboardPerformance() {
  try {
    console.log('Testing dashboard performance...');
    
    const startTime = Date.now();
    
    // Test parallel loading
    const [stats, enhanced] = await Promise.all([
      getDashboardStats(),
      getEnhancedDashboardData()
    ]);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`Dashboard loaded in ${loadTime}ms`);
    console.log('Stats loaded:', !!stats);
    console.log('Enhanced data loaded:', !!enhanced);
    
    return {
      loadTime,
      statsLoaded: !!stats,
      enhancedLoaded: !!enhanced,
      notificationCount: enhanced.recentNotifications.length
    };
  } catch (error) {
    console.error('Failed to test dashboard performance:', error);
    throw error;
  }
}