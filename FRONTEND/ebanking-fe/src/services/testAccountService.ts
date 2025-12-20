// Test script for account service - can be run from browser console
import { getAllAccounts, getEnrichedAccounts, getAccountStats } from './accountService';
import { ENDPOINTS } from './URL';
import fetchClient from './fetch';

export async function testAccountServiceFromConsole() {
  console.log('🏦 Testing Account Service...');
  console.log('Endpoint URL:', ENDPOINTS.ACCOUNTS);
  
  // Test 1: Raw API call
  console.log('\n1️⃣ Testing raw API call...');
  try {
    const rawResponse = await fetchClient.get(ENDPOINTS.ACCOUNTS);
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
  
  // Test 2: getAllAccounts
  console.log('\n2️⃣ Testing getAllAccounts()...');
  try {
    const accounts = await getAllAccounts();
    console.log('✅ getAllAccounts() result:', {
      count: accounts.length,
      firstAccount: accounts[0],
      sampleAccounts: accounts.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ getAllAccounts() failed:', error);
  }
  
  // Test 3: getEnrichedAccounts
  console.log('\n3️⃣ Testing getEnrichedAccounts()...');
  try {
    const enrichedAccounts = await getEnrichedAccounts();
    console.log('✅ getEnrichedAccounts() result:', {
      count: enrichedAccounts.length,
      firstAccount: enrichedAccounts[0],
      sampleAccounts: enrichedAccounts.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ getEnrichedAccounts() failed:', error);
  }
  
  // Test 4: getAccountStats
  console.log('\n4️⃣ Testing getAccountStats()...');
  try {
    const stats = await getAccountStats();
    console.log('✅ getAccountStats() result:', stats);
  } catch (error) {
    console.error('❌ getAccountStats() failed:', error);
  }
  
  console.log('\n✨ Account service test completed!');
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testAccountService = testAccountServiceFromConsole;
  console.log('💡 Run testAccountService() in console to test account service');
}