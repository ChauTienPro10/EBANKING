/**
 * Test file for notification search functionality
 */

import { 
  searchNotifications, 
  type SearchNotificationParams 
} from './notificationService';

/**
 * Test basic search functionality
 */
export async function testSearchByTitle() {
  try {
    console.log('Testing search by title...');
    
    const params: SearchNotificationParams = {
      title: 'á', // Based on your sample data
      index: 0,
      limit: 5
    };

    const result = await searchNotifications(params);
    console.log('Search by title result:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to search by title:', error);
    throw error;
  }
}

/**
 * Test search by type
 */
export async function testSearchByType() {
  try {
    console.log('Testing search by type...');
    
    const params: SearchNotificationParams = {
      type: 'PERSONAL',
      index: 0,
      limit: 10
    };

    const result = await searchNotifications(params);
    console.log('Search by type result:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to search by type:', error);
    throw error;
  }
}

/**
 * Test search by username
 */
export async function testSearchByUsername() {
  try {
    console.log('Testing search by username...');
    
    const params: SearchNotificationParams = {
      username: 'test12@gmail.com', // Based on your sample data
      index: 0,
      limit: 10
    };

    const result = await searchNotifications(params);
    console.log('Search by username result:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to search by username:', error);
    throw error;
  }
}

/**
 * Test search by date range
 */
export async function testSearchByDateRange() {
  try {
    console.log('Testing search by date range...');
    
    // Search for notifications from today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const params: SearchNotificationParams = {
      fromDate: startOfDay.getTime(),
      toDate: endOfDay.getTime(),
      index: 0,
      limit: 10
    };

    const result = await searchNotifications(params);
    console.log('Search by date range result:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to search by date range:', error);
    throw error;
  }
}

/**
 * Test combined search criteria
 */
export async function testCombinedSearch() {
  try {
    console.log('Testing combined search...');
    
    const params: SearchNotificationParams = {
      type: 'PERSONAL',
      username: 'test12@gmail.com',
      index: 0,
      limit: 5
    };

    const result = await searchNotifications(params);
    console.log('Combined search result:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to perform combined search:', error);
    throw error;
  }
}

/**
 * Test search with pagination
 */
export async function testSearchPagination() {
  try {
    console.log('Testing search pagination...');
    
    const params: SearchNotificationParams = {
      type: 'PERSONAL',
      index: 0,
      limit: 2
    };

    // Get first page
    const page1 = await searchNotifications(params);
    console.log('Page 1:', page1);
    
    // Get second page if available
    if (page1.totalPages > 1) {
      const page2 = await searchNotifications({ ...params, index: 1 });
      console.log('Page 2:', page2);
      return { page1, page2 };
    }
    
    return { page1 };
  } catch (error) {
    console.error('Failed to test search pagination:', error);
    throw error;
  }
}

/**
 * Test empty search (should fail according to backend validation)
 */
export async function testEmptySearch() {
  try {
    console.log('Testing empty search (should fail)...');
    
    const params: SearchNotificationParams = {
      index: 0,
      limit: 10
    };

    const result = await searchNotifications(params);
    console.log('Empty search result (unexpected):', result);
    
    return result;
  } catch (error: any) {
    console.log('Empty search failed as expected:', error.message);
    return { error: error.message };
  }
}