import { lockAccount, getEnrichedAccountByAccountId } from './accountService';

/**
 * Test the complete lock flow to debug UI update issues
 */
export async function testLockFlow(accountId: string) {
  console.log('=== Testing Lock Flow ===');
  console.log('AccountId:', accountId);
  
  try {
    // 1. Get account before lock
    console.log('\n1. Getting account before lock...');
    const beforeLock = await getEnrichedAccountByAccountId(accountId);
    console.log('Before lock:', {
      isLocked: beforeLock?.isLocked,
      status: beforeLock?.status,
      normalizedStatus: beforeLock?.normalizedStatus,
      lockReason: beforeLock?.lockReason,
      lockedBy: beforeLock?.lockedBy
    });
    
    // 2. Lock the account
    console.log('\n2. Locking account...');
    await lockAccount(accountId, 'Test lock reason', 'Test Admin', 'Test notes');
    console.log('Lock request completed');
    
    // 3. Wait a bit
    console.log('\n3. Waiting 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Get account after lock
    console.log('\n4. Getting account after lock...');
    const afterLock = await getEnrichedAccountByAccountId(accountId);
    console.log('After lock:', {
      isLocked: afterLock?.isLocked,
      status: afterLock?.status,
      normalizedStatus: afterLock?.normalizedStatus,
      lockReason: afterLock?.lockReason,
      lockedBy: afterLock?.lockedBy,
      lockedAt: afterLock?.lockedAt
    });
    
    // 5. Compare
    console.log('\n5. Comparison:');
    console.log('Status changed:', beforeLock?.normalizedStatus, '→', afterLock?.normalizedStatus);
    console.log('isLocked changed:', beforeLock?.isLocked, '→', afterLock?.isLocked);
    
    return {
      before: beforeLock,
      after: afterLock,
      success: afterLock?.isLocked === true
    };
    
  } catch (error) {
    console.error('Lock flow test failed:', error);
    throw error;
  }
}

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  console.log('Lock flow test module loaded. Call testLockFlow(accountId) to run test.');
}