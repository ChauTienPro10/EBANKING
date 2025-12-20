// Test complete account flow from UI to service
import { getEnrichedAccounts, filterAccounts, paginateAccounts } from './accountService';

export async function testCompleteAccountFlow() {
  console.log('🔄 Testing Complete Account Flow...');
  
  try {
    // Step 1: Load all accounts (like store does)
    console.log('\n1️⃣ Loading all accounts...');
    const allAccounts = await getEnrichedAccounts();
    console.log(`✅ Loaded ${allAccounts.length} accounts`);
    
    if (allAccounts.length > 0) {
      console.log('📋 Sample account structure:', {
        accountNumber: allAccounts[0].accountNumber,
        userFullName: allAccounts[0].userFullName,
        accountType: allAccounts[0].accountType,
        balance: allAccounts[0].balance,
        currency: allAccounts[0].currency,
        status: allAccounts[0].status,
        isLocked: allAccounts[0].isLocked,
        isPrimary: allAccounts[0].isPrimary,
        normalizedStatus: allAccounts[0].normalizedStatus,
        // Computed fields
        id: allAccounts[0].id,
        ownerName: allAccounts[0].ownerName,
        type: allAccounts[0].type,
      });
    }
    
    // Step 2: Test filtering (like when user searches)
    console.log('\n2️⃣ Testing search filters...');
    
    const searchTests = [
      { search: '', status: 'all' as any, description: 'No filters' },
      { search: 'Nguyễn', status: 'all' as any, description: 'Search by name' },
      { search: '597630', status: 'all' as any, description: 'Search by account number' },
      { search: 'SAVINGS', status: 'all' as any, description: 'Search by account type' },
      { search: '', status: 'Active' as any, description: 'Filter by Active status' },
      { search: '', status: 'Locked' as any, description: 'Filter by Locked status' },
      { search: 'Nguyễn', status: 'Active' as any, description: 'Combined: search + status' },
    ];
    
    for (const test of searchTests) {
      console.log(`\n   🔍 ${test.description}:`);
      console.log(`      Filters: search="${test.search}", status="${test.status}"`);
      
      const filtered = filterAccounts(allAccounts, test);
      console.log(`      Results: ${filtered.length} accounts`);
      
      if (filtered.length > 0 && filtered.length <= 3) {
        filtered.forEach((acc, idx) => {
          console.log(`      ${idx + 1}. ${acc.accountNumber} | ${acc.userFullName} | ${acc.accountType} | ${acc.normalizedStatus}`);
        });
      } else if (filtered.length > 3) {
        console.log(`      First 3 results:`);
        filtered.slice(0, 3).forEach((acc, idx) => {
          console.log(`      ${idx + 1}. ${acc.accountNumber} | ${acc.userFullName} | ${acc.accountType} | ${acc.normalizedStatus}`);
        });
      }
    }
    
    // Step 3: Test pagination (like store does)
    console.log('\n3️⃣ Testing pagination...');
    
    const paginationTests = [
      { page: 1, limit: 5 },
      { page: 2, limit: 5 },
      { page: 1, limit: 10 },
    ];
    
    for (const test of paginationTests) {
      console.log(`\n   📄 Page ${test.page}, Limit ${test.limit}:`);
      const paginated = paginateAccounts(allAccounts, test.page, test.limit);
      console.log(`      Total: ${paginated.total}, Pages: ${paginated.totalPages}`);
      console.log(`      Current page data: ${paginated.data.length} accounts`);
      
      paginated.data.forEach((acc, idx) => {
        const globalIndex = (test.page - 1) * test.limit + idx + 1;
        console.log(`      ${globalIndex}. ${acc.accountNumber} | ${acc.userFullName}`);
      });
    }
    
    // Step 4: Test combined flow (filter + pagination)
    console.log('\n4️⃣ Testing combined flow (filter + pagination)...');
    
    const searchTerm = allAccounts.length > 0 ? allAccounts[0].userFullName.split(' ')[0] : 'Test';
    console.log(`   🔍 Searching for: "${searchTerm}"`);
    
    const filtered = filterAccounts(allAccounts, { search: searchTerm, status: 'all' });
    console.log(`   📊 Filtered results: ${filtered.length} accounts`);
    
    const paginated = paginateAccounts(filtered, 1, 3);
    console.log(`   📄 Paginated (page 1, limit 3): ${paginated.data.length} accounts`);
    
    paginated.data.forEach((acc, idx) => {
      console.log(`   ${idx + 1}. ${acc.accountNumber} | ${acc.userFullName} | ${acc.accountType}`);
    });
    
    console.log('\n✅ Complete account flow test finished!');
    
    return {
      totalAccounts: allAccounts.length,
      sampleAccount: allAccounts[0],
      searchTests: searchTests.map(test => ({
        ...test,
        resultCount: filterAccounts(allAccounts, test).length
      })),
      paginationTests: paginationTests.map(test => ({
        ...test,
        result: paginateAccounts(allAccounts, test.page, test.limit)
      }))
    };
    
  } catch (error) {
    console.error('❌ Account flow test failed:', error);
    throw error;
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testCompleteAccountFlow = testCompleteAccountFlow;
  console.log('💡 Run testCompleteAccountFlow() in console to test complete account flow');
}