/**
 * Test file for push notification to user
 * This file demonstrates how to use the new push notification API
 */

import { 
  pushNotificationToUser, 
  pushNotificationToUsers,
  type PushNotiToUserPayload,
  type BulkPushNotiPayload 
} from './notificationService';

/**
 * Test push notification to a single user
 */
export async function testPushToUser() {
  try {
    const payload: PushNotiToUserPayload = {
      title: 'Test Notification',
      content: 'This is a test notification sent to a specific user',
      username: 'testuser123', // Replace with actual username
    };

    console.log('Sending notification to user:', payload);
    const result = await pushNotificationToUser(payload);
    console.log('Notification sent successfully:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

/**
 * Example usage in a component or service
 */
export async function sendWelcomeNotification(username: string) {
  try {
    const payload: PushNotiToUserPayload = {
      title: 'Chào mừng!',
      content: 'Chào mừng bạn đến với hệ thống E-Banking',
      username,
    };

    const result = await pushNotificationToUser(payload);
    console.log('Welcome notification sent to:', username);
    
    return result;
  } catch (error) {
    console.error('Failed to send welcome notification:', error);
    throw error;
  }
}

/**
 * Test push notification to multiple users (bulk)
 */
export async function testBulkPushToUsers() {
  try {
    const payload: BulkPushNotiPayload = {
      title: 'Bulk Test Notification',
      content: 'This is a test notification sent to multiple users',
      usernames: ['user1', 'user2', 'user3'], // Replace with actual usernames
    };

    console.log('Sending bulk notification to users:', payload);
    const result = await pushNotificationToUsers(payload);
    console.log('Bulk notification sent successfully:', result);
    
    if (result.results) {
      console.log('Individual results:');
      result.results.forEach(r => {
        console.log(`- ${r.username}: ${r.success ? 'Success' : 'Failed'} ${r.message || ''}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('Failed to send bulk notification:', error);
    throw error;
  }
}

/**
 * Example: Send bulk welcome notifications to new users
 */
export async function sendBulkWelcomeNotifications(usernames: string[]) {
  try {
    const payload: BulkPushNotiPayload = {
      title: 'Chào mừng!',
      content: 'Chào mừng các bạn đến với hệ thống E-Banking',
      usernames,
    };

    const result = await pushNotificationToUsers(payload);
    console.log(`Welcome notifications sent to ${usernames.length} users`);
    console.log(`Success: ${result.successCount || 0}, Failed: ${result.failedCount || 0}`);
    
    return result;
  } catch (error) {
    console.error('Failed to send bulk welcome notifications:', error);
    throw error;
  }
}

/**
 * Example: Send system maintenance notification to selected users
 */
export async function sendMaintenanceNotificationToUsers(
  usernames: string[],
  maintenanceTime: string
) {
  try {
    const payload: BulkPushNotiPayload = {
      title: 'Thông báo bảo trì hệ thống',
      content: `Hệ thống sẽ được bảo trì vào ${maintenanceTime}. Vui lòng hoàn tất các giao dịch trước thời gian này.`,
      usernames,
    };

    const result = await pushNotificationToUsers(payload);
    console.log(`Maintenance notifications sent to ${usernames.length} users`);
    
    return result;
  } catch (error) {
    console.error('Failed to send maintenance notifications:', error);
    throw error;
  }
}

/**
 * Example: Send transaction notification
 */
export async function sendTransactionNotification(
  username: string,
  amount: number,
  transactionType: 'deposit' | 'withdrawal' | 'transfer'
) {
  try {
    const typeText = {
      deposit: 'Nạp tiền',
      withdrawal: 'Rút tiền',
      transfer: 'Chuyển khoản',
    };

    const payload: PushNotiToUserPayload = {
      title: `${typeText[transactionType]} thành công`,
      content: `Giao dịch ${typeText[transactionType].toLowerCase()} ${amount.toLocaleString('vi-VN')} VNĐ đã được thực hiện thành công`,
      username,
    };

    const result = await pushNotificationToUser(payload);
    console.log('Transaction notification sent to:', username);
    
    return result;
  } catch (error) {
    console.error('Failed to send transaction notification:', error);
    throw error;
  }
}

/**
 * Example: Send bulk transaction notifications (e.g., interest payment)
 */
export async function sendBulkTransactionNotifications(
  users: Array<{ username: string; amount: number }>,
  transactionType: 'interest' | 'bonus' | 'refund'
) {
  try {
    const typeText = {
      interest: 'Lãi suất',
      bonus: 'Thưởng',
      refund: 'Hoàn tiền',
    };

    // Group users by amount for more efficient messaging
    const usersByAmount = users.reduce((acc, user) => {
      const key = user.amount.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(user.username);
      return acc;
    }, {} as Record<string, string[]>);

    const results = [];
    
    for (const [amount, usernames] of Object.entries(usersByAmount)) {
      const payload: BulkPushNotiPayload = {
        title: `${typeText[transactionType]} đã được cộng`,
        content: `${typeText[transactionType]} ${parseInt(amount).toLocaleString('vi-VN')} VNĐ đã được cộng vào tài khoản của bạn`,
        usernames,
      };

      const result = await pushNotificationToUsers(payload);
      results.push(result);
      console.log(`${typeText[transactionType]} notifications sent to ${usernames.length} users for amount ${amount}`);
    }
    
    return results;
  } catch (error) {
    console.error('Failed to send bulk transaction notifications:', error);
    throw error;
  }
}