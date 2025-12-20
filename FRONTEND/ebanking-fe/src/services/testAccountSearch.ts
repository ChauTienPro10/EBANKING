import { searchAccounts } from './accountService';

/**
 * Test the account search functionality
 */
export async function testAccountSearch() {
  console.log('=== Testing Account Search ===');
  
  try {
    // Test 1: Search by keyword
    console.log('\n1. Testing keyword search...');
    const keywordResults = await searchAccounts({ keyword: 'john' });
    console.log('Keyword search results:', keywordResults.length, keywordResults);
    
    // Test 2: Search by userName
    console.log('\n2. Testing userName search...');
    const userNameResults = await searchAccounts({ userName: 'john' });
    console.log('UserName search results:', userNameResults.length, userNameResults);
    
    // Test 3: Search by accountNumber
    console.log('\n3. Testing accountNumber search...');
    const accountNumberResults = await searchAccounts({ accountNumber: '123' });
    console.log('AccountNumber search results:', accountNumberResults.length, accountNumberResults);
    
    // Test 4: Combined search
    console.log('\n4. Testing combined search...');
    const combinedResults = await searchAccounts({ 
      userName: 'john',
      accountNumber: '123'
    });
    console.log('Combined search results:', combinedResults.length, combinedResults);
    
    // Test 5: Empty search (should return bad request or empty)
    console.log('\n5. Testing empty search...');
    const emptyResults = await searchAccounts({});
    console.log('Empty search results:', emptyResults.length, emptyResults);
    
  } catch (error) {
    console.error('Search test failed:', error);
  }
}

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  console.log('Account search test module loaded. Call testAccountSearch() to run tests.');
}