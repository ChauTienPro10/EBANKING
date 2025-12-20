// Debug function to inspect actual API response structure
import fetchClient from './fetch';
import { ENDPOINTS } from './URL';

export async function debugAccountAPI() {
  console.log('🔍 Debugging Account API...');
  console.log('Endpoint:', ENDPOINTS.ACCOUNTS);
  
  try {
    const response = await fetchClient.get(ENDPOINTS.ACCOUNTS);
    
    console.log('📊 Raw Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    console.log('📋 Response Data Structure:', {
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasSuccess: 'success' in response.data,
      hasMessage: 'message' in response.data,
      hasData: 'data' in response.data,
      keys: Object.keys(response.data || {}),
    });
    
    console.log('📄 Full Response Data:', response.data);
    
    // If it's wrapped response
    if (response.data && 'data' in response.data) {
      const accounts = response.data.data;
      console.log('📦 Accounts Array:', {
        isArray: Array.isArray(accounts),
        length: accounts?.length || 0,
        firstAccount: accounts?.[0],
        accountKeys: accounts?.[0] ? Object.keys(accounts[0]) : [],
        sampleAccounts: accounts?.slice(0, 3) || []
      });
    }
    
    // If it's direct array
    if (Array.isArray(response.data)) {
      console.log('📦 Direct Accounts Array:', {
        length: response.data.length,
        firstAccount: response.data[0],
        accountKeys: response.data[0] ? Object.keys(response.data[0]) : [],
        sampleAccounts: response.data.slice(0, 3)
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    throw error;
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).debugAccountAPI = debugAccountAPI;
  console.log('💡 Run debugAccountAPI() in console to inspect API response');
}