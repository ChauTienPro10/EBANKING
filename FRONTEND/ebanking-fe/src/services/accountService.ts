import fetchClient from './fetch';
import type { ApiResponse } from './fetch';
import { ENDPOINTS } from './URL';
import { type User } from './userService';

// Account interface based on actual API response
export interface Account {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string; // "ACTIVE", "INACTIVE", etc.
  openedDate: string;
  closedDate: string | null;
  isPrimary: boolean;
  userId: number;
  userFullName: string;
  lastTransactionAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  isLocked: boolean;
  lockType: string | null;
  lockReason: string | null;
  lockedAt: string | null;
  lockedBy: string | null;
  unlockedAt: string | null;
  unlockedBy: string | null;
  lockNotes: string | null;
}

// Normalized account status for UI consistency
export type AccountStatus = "Active" | "Locked" | "Inactive" | "Closed";

// Enriched account with additional computed fields
export interface EnrichedAccount extends Account {
  // Computed fields for UI
  id: string; // accountNumber for compatibility
  customerId: string; // userId as string for compatibility
  type: string; // accountType for compatibility
  ownerName: string; // userFullName for compatibility
  normalizedStatus: AccountStatus; // normalized status
  
  // Additional user info (if needed)
  ownerEmail?: string;
  ownerPhone?: string;
}

// API response structure (assuming similar to users API)
export interface AccountListResponse {
  success: boolean;
  message: string;
  data: Account[];
}

// Account filters for API requests
export interface AccountFilters {
  search?: string; // keyword search
  userName?: string; // search by user name
  accountNumber?: string; // search by account number
  status?: AccountStatus | "all";
  customerId?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Normalize account status from API to UI format
 */
function normalizeAccountStatus(apiStatus: string, isLocked: boolean, closedDate: string | null): AccountStatus {
  if (closedDate) return "Closed";
  if (isLocked) return "Locked";
  if (apiStatus === "ACTIVE") return "Active";
  if (apiStatus === "INACTIVE") return "Inactive";
  return "Active"; // default
}

/**
 * Search accounts using backend search endpoint
 */
export async function searchAccounts(filters: {
  keyword?: string;
  userName?: string;
  accountNumber?: string;
}): Promise<Account[]> {
  try {
    console.log('AccountService: Searching accounts with filters:', filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.keyword?.trim()) {
      params.append('keyword', filters.keyword.trim());
    }
    if (filters.userName?.trim()) {
      params.append('userName', filters.userName.trim());
    }
    if (filters.accountNumber?.trim()) {
      params.append('accountNumber', filters.accountNumber.trim());
    }
    
    const queryString = params.toString();
    const url = queryString ? `${ENDPOINTS.ACCOUNTS_SEARCH}?${queryString}` : ENDPOINTS.ACCOUNTS_SEARCH;
    
    console.log('AccountService: Search URL:', url);
    
    const response: ApiResponse<Account[]> = await fetchClient.get(url);
    
    console.log('AccountService: Search response:', response.data);
    
    // The API returns direct array of accounts
    const accounts = Array.isArray(response.data) ? response.data : [];
    
    console.log('AccountService: Search results:', accounts.length, accounts);
    return accounts;
  } catch (error) {
    console.error('AccountService: Failed to search accounts:', error);
    throw new Error('Không thể tìm kiếm tài khoản');
  }
}

/**
 * Get all accounts from API - handles the actual API response format
 */
export async function getAllAccounts(): Promise<Account[]> {
  try {
    console.log('AccountService: Fetching accounts from API...');
    const response: ApiResponse<Account[]> = await fetchClient.get(ENDPOINTS.ACCOUNTS);
    
    console.log('AccountService: Raw response:', response.data);
    
    // The API returns direct array of accounts
    const accounts = Array.isArray(response.data) ? response.data : [];
    
    console.log('AccountService: Parsed accounts:', accounts.length, accounts);
    return accounts;
  } catch (error) {
    console.error('AccountService: Failed to fetch accounts:', error);
    throw new Error('Không thể tải danh sách tài khoản');
  }
}

/**
 * Get account by accountId (numeric ID) - handles the actual API response format
 */
export async function getAccountByAccountId(accountId: string): Promise<Account | null> {
  try {
    console.log('AccountService: Fetching account by accountId:', accountId);
    const response: ApiResponse<Account> = await fetchClient.get(ENDPOINTS.ACCOUNT_BY_ID(accountId));
    
    console.log('AccountService: Account by accountId response:', response.data);
    console.log('AccountService: Account isLocked status:', response.data?.isLocked);
    console.log('AccountService: Account status:', response.data?.status);
    return response.data || null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error('AccountService: Failed to fetch account by accountId:', error);
    throw new Error('Không thể tải thông tin tài khoản');
  }
}

/**
 * Get account by ID - handles the actual API response format
 */
export async function getAccountById(id: string): Promise<Account | null> {
  try {
    console.log('AccountService: Fetching account by ID:', id);
    const response: ApiResponse<Account> = await fetchClient.get(ENDPOINTS.ACCOUNT_BY_NUMBER_ID(id));
    
    console.log('AccountService: Account by ID response:', response.data);
    return response.data || null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error('AccountService: Failed to fetch account by ID:', error);
    throw new Error('Không thể tải thông tin tài khoản');
  }
}

/**
 * Convert Account to EnrichedAccount with computed fields for UI compatibility
 */
export function enrichAccount(account: Account, users?: User[]): EnrichedAccount {
  // Find user info if users array is provided
  const user = users?.find(u => 
    u.id === account.userId || 
    u.userId === account.userId
  );
  
  return {
    ...account,
    // Computed fields for UI compatibility
    id: account.accountNumber, // Use accountNumber as ID for UI
    customerId: account.userId.toString(), // Convert userId to string
    type: account.accountType, // Use accountType as type
    ownerName: account.userFullName, // Use userFullName from API
    normalizedStatus: normalizeAccountStatus(account.status, account.isLocked, account.closedDate),
    
    // Additional user info if available
    ownerEmail: user?.email,
    ownerPhone: user?.phone || undefined,
  };
}

/**
 * Get enriched accounts with computed fields for UI - now supports search
 */
export async function getEnrichedAccounts(filters?: AccountFilters): Promise<EnrichedAccount[]> {
  try {
    console.log('Loading accounts with filters:', filters);
    
    let accounts: Account[];
    
    // If we have search filters, use the search endpoint
    if (filters?.search || filters?.userName || filters?.accountNumber) {
      accounts = await searchAccounts({
        keyword: filters.search,
        userName: filters.userName,
        accountNumber: filters.accountNumber,
      });
    } else {
      // Otherwise, get all accounts
      accounts = await getAllAccounts();
    }
    
    console.log('Accounts loaded:', accounts.length);
    
    // Convert to enriched accounts
    const enrichedAccounts = accounts.map(account => enrichAccount(account));
    
    console.log('Enriched accounts:', enrichedAccounts.length);
    return enrichedAccounts;
  } catch (error) {
    console.error('Failed to get enriched accounts:', error);
    throw error;
  }
}

/**
 * Get enriched account by accountId (numeric ID)
 */
export async function getEnrichedAccountByAccountId(accountId: string): Promise<EnrichedAccount | null> {
  try {
    console.log('AccountService: Getting enriched account by accountId:', accountId);
    const account = await getAccountByAccountId(accountId);
    
    if (!account) {
      console.log('AccountService: No account found for accountId:', accountId);
      return null;
    }
    
    console.log('AccountService: Raw account data:', account);
    const enriched = enrichAccount(account);
    console.log('AccountService: Enriched account data:', enriched);
    console.log('AccountService: Normalized status:', enriched.normalizedStatus);
    
    return enriched;
  } catch (error) {
    console.error('Failed to get enriched account by accountId:', error);
    throw error;
  }
}

/**
 * Get enriched account by ID
 */
export async function getEnrichedAccountById(id: string): Promise<EnrichedAccount | null> {
  try {
    const account = await getAccountById(id);
    
    if (!account) {
      return null;
    }
    
    return enrichAccount(account);
  } catch (error) {
    console.error('Failed to get enriched account by ID:', error);
    throw error;
  }
}

/**
 * Filter accounts based on criteria (client-side filtering for non-search criteria)
 */
export function filterAccounts(
  accounts: EnrichedAccount[], 
  filters: AccountFilters
): EnrichedAccount[] {
  console.log('AccountService: Filtering accounts...', {
    totalAccounts: accounts.length,
    filters
  });
  
  let filtered = [...accounts];
  
  // Filter by status (client-side since backend doesn't handle this)
  if (filters.status && filters.status !== 'all') {
    const beforeCount = filtered.length;
    filtered = filtered.filter(account => account.normalizedStatus === filters.status);
    console.log(`AccountService: Status filter "${filters.status}": ${beforeCount} → ${filtered.length}`);
  }
  
  // Filter by customer ID (client-side)
  if (filters.customerId) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(account => account.userId.toString() === filters.customerId);
    console.log(`AccountService: Customer ID filter "${filters.customerId}": ${beforeCount} → ${filtered.length}`);
  }
  
  // Filter by account type (client-side)
  if (filters.type) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(account => account.accountType === filters.type);
    console.log(`AccountService: Account type filter "${filters.type}": ${beforeCount} → ${filtered.length}`);
  }
  
  console.log('AccountService: Final filtered result:', filtered.length, 'accounts');
  return filtered;
}

/**
 * Get paginated accounts
 */
export function paginateAccounts(
  accounts: EnrichedAccount[],
  page: number = 1,
  limit: number = 20
): {
  data: EnrichedAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const total = accounts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = accounts.slice(startIndex, endIndex);
  
  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Lock account using backend endpoint
 */
export async function lockAccount(
  accountId: string, 
  reason: string, 
  lockedBy: string,
  notes?: string
): Promise<void> {
  try {
    console.log('AccountService: Locking account:', { accountId, reason, lockedBy, notes });
    
    const response = await fetchClient.post(ENDPOINTS.ACCOUNT_LOCK(accountId), {
      reason: reason.trim(),
      lockedBy: lockedBy.trim(),
      notes: notes?.trim() || undefined
    });
    
    console.log('AccountService: Lock response:', response);
    
    // Check if the response indicates success
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to lock account');
    }
    
  } catch (error: any) {
    console.error('AccountService: Failed to lock account:', error);
    
    // Handle different error types
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Không thể khóa tài khoản');
    }
  }
}

/**
 * Unlock account using backend endpoint
 */
export async function unlockAccount(accountId: string, unlockedBy: string): Promise<void> {
  try {
    console.log('AccountService: Unlocking account:', { accountId, unlockedBy });
    
    const response = await fetchClient.post(ENDPOINTS.ACCOUNT_UNLOCK(accountId), {
      unlockedBy: unlockedBy.trim()
    });
    
    console.log('AccountService: Unlock response:', response);
    
    // Check if the response indicates success
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to unlock account');
    }
    
  } catch (error: any) {
    console.error('AccountService: Failed to unlock account:', error);
    
    // Handle different error types
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Không thể mở khóa tài khoản');
    }
  }
}

/**
 * Get account statistics
 */
export async function getAccountStats(): Promise<{
  total: number;
  active: number;
  locked: number;
  inactive: number;
  closed: number;
  totalBalance: number;
  averageBalance: number;
  primaryAccounts: number;
}> {
  try {
    const accounts = await getAllAccounts();
    
    const total = accounts.length;
    const active = accounts.filter(acc => acc.status === 'ACTIVE' && !acc.isLocked && !acc.closedDate).length;
    const locked = accounts.filter(acc => acc.isLocked).length;
    const inactive = accounts.filter(acc => acc.status === 'INACTIVE').length;
    const closed = accounts.filter(acc => acc.closedDate !== null).length;
    const primaryAccounts = accounts.filter(acc => acc.isPrimary).length;
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const averageBalance = total > 0 ? totalBalance / total : 0;
    
    return {
      total,
      active,
      locked,
      inactive,
      closed,
      totalBalance,
      averageBalance,
      primaryAccounts,
    };
  } catch (error) {
    console.error('Failed to get account stats:', error);
    throw new Error('Không thể tải thống kê tài khoản');
  }
}

// Export all types and functions