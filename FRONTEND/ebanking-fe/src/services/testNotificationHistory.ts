/**
 * Test file for notification history API
 * This file demonstrates how to use the new notification history API
 */

import { 
  listHistory, 
  formatNotificationForDisplay,
  getNotificationTypeText,
  type ListHistoryParams 
} from './notificationService';

/**
 * Test basic history loading
 */
export async function testLoadHistory() {
  try {
    console.log('Testing notification history API...');
    
    const params: ListHistoryParams = {
      index: 0,
      limit: 5
    };

    const result = await listHistory(params);
    console.log('History loaded successfully:', result);
    
    console.log(`Found ${result.total} total notifications`);
    console.log(`Showing page ${result.page} of ${result.totalPages}`);
    
    if (result.content.length > 0) {
      console.log('\nFirst few notifications:');
      result.content.forEach((notification, index) => {
        const formatted = formatNotificationForDisplay(notification);
        console.log(`${index + 1}. [${formatted.typeText}] ${notification.title}`);
        console.log(`   Content: ${notification.content}`);
        console.log(`   Time: ${formatted.time}`);
        if (notification.username) {
          console.log(`   Username: ${notification.username}`);
        }
        if (notification.amount) {
          console.log(`   Amount: ${notification.amount}`);
        }
        console.log('');
      });
    }
    
    return result;
  } catch (error) {
    console.error('Failed to load notification history:', error);
    throw error;
  }
}

/**
 * Test pagination
 */
export async function testHistoryPagination() {
  try {
    console.log('Testing notification history pagination...');
    
    // Load first page
    const page1 = await listHistory({ index: 0, limit: 3 });
    console.log('Page 1:', page1.content.length, 'notifications');
    
    // Load second page if available
    if (page1.totalPages > 1) {
      const page2 = await listHistory({ index: 1, limit: 3 });
      console.log('Page 2:', page2.content.length, 'notifications');
      
      return { page1, page2 };
    }
    
    return { page1 };
  } catch (error) {
    console.error('Failed to test pagination:', error);
    throw error;
  }
}

/**
 * Test different limit sizes
 */
export async function testDifferentLimits() {
  try {
    console.log('Testing different limit sizes...');
    
    const limits = [1, 5, 10, 20];
    const results = [];
    
    for (const limit of limits) {
      const result = await listHistory({ index: 0, limit });
      console.log(`Limit ${limit}: Got ${result.content.length} notifications`);
      results.push({ limit, count: result.content.length, total: result.total });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to test different limits:', error);
    throw error;
  }
}

/**
 * Analyze notification types
 */
export async function analyzeNotificationTypes() {
  try {
    console.log('Analyzing notification types...');
    
    const result = await listHistory({ index: 0, limit: 50 });
    
    const typeCount = result.content.reduce((acc, notification) => {
      const type = notification.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Notification types distribution:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`- ${getNotificationTypeText(type as any)}: ${count}`);
    });
    
    return typeCount;
  } catch (error) {
    console.error('Failed to analyze notification types:', error);
    throw error;
  }
}

/**
 * Example: Get recent notifications for dashboard
 */
export async function getRecentNotifications(limit: number = 10) {
  try {
    const result = await listHistory({ index: 0, limit });
    
    return result.content.map(notification => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: getNotificationTypeText(notification.type),
      time: formatNotificationForDisplay(notification).time,
      isTransaction: notification.type === 'TRANSACTION',
      amount: notification.amount,
      username: notification.username,
    }));
  } catch (error) {
    console.error('Failed to get recent notifications:', error);
    throw error;
  }
}