// Test account service with the sample data provided
import { enrichAccount, type Account } from './accountService';

// Sample data from API
const sampleAccountData: Account = {
  accountId: 5,
  accountNumber: "597630158008",
  accountType: "SAVINGS",
  balance: 600000000.00,
  currency: "VND",
  status: "ACTIVE",
  openedDate: "2025-11-21T15:32:16.184747",
  closedDate: null,
  isPrimary: true,
  userId: 302,
  userFullName: "Nguyễn Nhật Hằng",
  lastTransactionAt: null,
  createdAt: "2025-11-21T15:32:16.184747",
  updatedAt: null,
  isLocked: false,
  lockType: null,
  lockReason: null,
  lockedAt: null,
  lockedBy: null,
  unlockedAt: null,
  unlockedBy: null,
  lockNotes: null
};

export function testAccountEnrichment() {
  console.log('🧪 Testing Account Enrichment with Sample Data...');
  
  console.log('📋 Original Account Data:', sampleAccountData);
  
  const enrichedAccount = enrichAccount(sampleAccountData);
  
  console.log('✨ Enriched Account Data:', enrichedAccount);
  
  console.log('🔍 Key Mappings:', {
    'accountNumber → id': `${sampleAccountData.accountNumber} → ${enrichedAccount.id}`,
    'userId → customerId': `${sampleAccountData.userId} → ${enrichedAccount.customerId}`,
    'accountType → type': `${sampleAccountData.accountType} → ${enrichedAccount.type}`,
    'userFullName → ownerName': `${sampleAccountData.userFullName} → ${enrichedAccount.ownerName}`,
    'status + isLocked → normalizedStatus': `${sampleAccountData.status} + ${sampleAccountData.isLocked} → ${enrichedAccount.normalizedStatus}`,
  });
  
  console.log('💰 Balance Display:', `${enrichedAccount.balance.toLocaleString()} ${enrichedAccount.currency}`);
  
  console.log('📅 Dates:', {
    opened: new Date(enrichedAccount.openedDate).toLocaleString('vi-VN'),
    created: new Date(enrichedAccount.createdAt).toLocaleString('vi-VN'),
    lastTransaction: enrichedAccount.lastTransactionAt ? new Date(enrichedAccount.lastTransactionAt).toLocaleString('vi-VN') : 'Chưa có',
  });
  
  console.log('🔒 Lock Status:', {
    isLocked: enrichedAccount.isLocked,
    lockReason: enrichedAccount.lockReason || 'N/A',
    lockType: enrichedAccount.lockType || 'N/A',
  });
  
  console.log('✅ Test completed successfully!');
  
  return enrichedAccount;
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testAccountEnrichment = testAccountEnrichment;
  console.log('💡 Run testAccountEnrichment() in console to test account enrichment');
}