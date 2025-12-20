// Debug functions to test user service
import { getAllUsers, getAllUsersAsSimple } from './userService';
import { api } from './URL';
import fetchClient from './fetch';

export async function debugUserService() {
  console.log('=== DEBUG USER SERVICE ===');
  
  // 1. Test endpoint URL
  console.log('GET_ALL_USER endpoint:', api.GET_ALL_USER);
  
  // 2. Test raw API call
  try {
    console.log('Testing raw API call...');
    const rawResponse = await fetchClient.get(api.GET_ALL_USER);
    console.log('Raw response:', rawResponse);
    console.log('Response data structure:', {
      hasData: !!rawResponse.data,
      hasSuccess: 'success' in rawResponse.data,
      hasMessage: 'message' in rawResponse.data,
      hasDataArray: 'data' in rawResponse.data,
      dataType: typeof rawResponse.data,
      dataKeys: Object.keys(rawResponse.data || {}),
    });
  } catch (error) {
    console.error('Raw API call failed:', error);
    return;
  }
  
  // 3. Test getAllUsers function
  try {
    console.log('Testing getAllUsers...');
    const users = await getAllUsers();
    console.log('getAllUsers result:', {
      count: users.length,
      firstUser: users[0],
      sampleUsers: users.slice(0, 3)
    });
  } catch (error) {
    console.error('getAllUsers failed:', error);
  }
  
  // 4. Test getAllUsersAsSimple function
  try {
    console.log('Testing getAllUsersAsSimple...');
    const simpleUsers = await getAllUsersAsSimple();
    console.log('getAllUsersAsSimple result:', {
      count: simpleUsers.length,
      firstUser: simpleUsers[0],
      sampleUsers: simpleUsers.slice(0, 3)
    });
  } catch (error) {
    console.error('getAllUsersAsSimple failed:', error);
  }
  
  console.log('=== END DEBUG ===');
}

// Function to test from browser console
(window as any).debugUserService = debugUserService;

export default debugUserService;