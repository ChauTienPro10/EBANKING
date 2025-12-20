// Test script for user service - can be run from browser console
import { getAllUsers, getAllUsersAsSimple } from './userService';
import { api } from './URL';
import fetchClient from './fetch';

export async function testUserServiceFromConsole() {
  console.log('🔍 Testing User Service...');
  console.log('Endpoint URL:', api.GET_ALL_USER);
  
  // Test 1: Raw API call
  console.log('\n1️⃣ Testing raw API call...');
  try {
    const rawResponse = await fetchClient.get(api.GET_ALL_USER);
    console.log('✅ Raw API Response:', {
      status: rawResponse.status,
      dataType: typeof rawResponse.data,
      structure: rawResponse.data,
      hasSuccess: 'success' in rawResponse.data,
      hasMessage: 'message' in rawResponse.data,
      hasData: 'data' in rawResponse.data,
      dataCount: rawResponse.data?.data?.length || 0
    });
  } catch (error) {
    console.error('❌ Raw API call failed:', error);
    return;
  }
  
  // Test 2: getAllUsers
  console.log('\n2️⃣ Testing getAllUsers()...');
  try {
    const users = await getAllUsers();
    console.log('✅ getAllUsers() result:', {
      count: users.length,
      firstUser: users[0],
      sampleUsers: users.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ getAllUsers() failed:', error);
  }
  
  // Test 3: getAllUsersAsSimple
  console.log('\n3️⃣ Testing getAllUsersAsSimple()...');
  try {
    const simpleUsers = await getAllUsersAsSimple();
    console.log('✅ getAllUsersAsSimple() result:', {
      count: simpleUsers.length,
      firstUser: simpleUsers[0],
      sampleUsers: simpleUsers.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ getAllUsersAsSimple() failed:', error);
  }
  
  console.log('\n✨ User service test completed!');
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testUserService = testUserServiceFromConsole;
  console.log('💡 Run testUserService() in console to test user service');
}