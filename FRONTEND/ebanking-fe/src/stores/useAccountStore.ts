import { create } from "zustand";
import { 
  getEnrichedAccounts, 
  getEnrichedAccountById, 
  getEnrichedAccountByAccountId,
  filterAccounts, 
  paginateAccounts,
  lockAccount,
  unlockAccount,
  type EnrichedAccount,
  type AccountStatus
} from "@/services/accountService";

export interface AccountFilters {
  search: string; // keyword search
  userName?: string; // search by user name  
  accountNumber?: string; // search by account number
  status?: AccountStatus | "all";
}

interface AccountStore {
  data: EnrichedAccount[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  filters: AccountFilters;

  selected?: EnrichedAccount | null;

  // actions
  setPage: (p: number) => void;
  setLimit: (n: number) => void;
  setFilters: (f: Partial<AccountFilters>) => void;
  fetch: () => Promise<void>;
  openDetail: (id: string) => Promise<void>;
  closeDetail: () => void;
  lock: (params: { id: string; reason: string; lockedBy: string; notes?: string }) => Promise<void>;
  unlock: (id: string, unlockedBy: string) => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  page: 1,
  limit: 20,
  total: 0,
  filters: { search: "", status: "all" },
  selected: null,

  setPage: (p) => set({ page: p }),
  setLimit: (n) => set({ limit: n, page: 1 }),
  setFilters: (f) => {
    console.log('AccountStore: Setting filters:', f);
    const currentFilters = get().filters;
    const newFilters = { ...currentFilters, ...f };
    console.log('AccountStore: New filters:', newFilters);
    set({ filters: newFilters, page: 1 });
  },

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      console.log('AccountStore: Fetching accounts...');
      
      // Get filters
      const { search, userName, accountNumber, status } = get().filters;
      
      // Get accounts from API (with search if needed)
      const allAccounts = await getEnrichedAccounts({
        search: search?.trim() || undefined,
        userName: userName?.trim() || undefined,
        accountNumber: accountNumber?.trim() || undefined,
      });
      console.log('AccountStore: Loaded accounts:', allAccounts.length);
      
      // Apply client-side filters (status, etc.)
      const filtered = filterAccounts(allAccounts, { status });
      console.log('AccountStore: Filtered accounts:', filtered.length);
      
      // Apply pagination
      const { page, limit } = get();
      const paginatedResult = paginateAccounts(filtered, page, limit);
      
      set({ 
        data: paginatedResult.data, 
        total: paginatedResult.total, 
        loading: false 
      });
      
      console.log('AccountStore: Page data:', paginatedResult.data.length);
    } catch (error: any) {
      console.error('AccountStore: Failed to fetch accounts:', error);
      set({ 
        error: error.message || 'Failed to fetch accounts', 
        loading: false,
        data: [],
        total: 0
      });
    }
  },

  openDetail: async (id) => {
    try {
      console.log('AccountStore: Opening account detail:', id);
      const account = await getEnrichedAccountById(id);
      set({ selected: account });
      console.log('AccountStore: Account detail loaded:', account);
    } catch (error: any) {
      console.error('AccountStore: Failed to load account detail:', error);
      set({ selected: null });
    }
  },
  
  closeDetail: () => set({ selected: null }),

  lock: async ({ id, reason, lockedBy, notes }) => {
    try {
      console.log('AccountStore: Locking account:', { id, reason, lockedBy, notes });
      await lockAccount(id, reason, lockedBy, notes);
      
      // Add a small delay to ensure backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the selected account first
      console.log('AccountStore: Refreshing selected account...');
      const updatedAccount = await getEnrichedAccountByAccountId(id);
      console.log('AccountStore: Updated account data:', updatedAccount);
      set({ selected: updatedAccount });
      
      // Then refresh the list
      console.log('AccountStore: Refreshing account list...');
      await get().fetch();
      
      console.log('AccountStore: Account locked successfully');
    } catch (error: any) {
      console.error('AccountStore: Failed to lock account:', error);
      throw error;
    }
  },
  
  unlock: async (id, unlockedBy) => {
    try {
      console.log('AccountStore: Unlocking account:', { id, unlockedBy });
      await unlockAccount(id, unlockedBy);
      
      // Add a small delay to ensure backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the selected account first
      console.log('AccountStore: Refreshing selected account...');
      const updatedAccount = await getEnrichedAccountByAccountId(id);
      console.log('AccountStore: Updated account data:', updatedAccount);
      set({ selected: updatedAccount });
      
      // Then refresh the list
      console.log('AccountStore: Refreshing account list...');
      await get().fetch();
      
      console.log('AccountStore: Account unlocked successfully');
    } catch (error: any) {
      console.error('AccountStore: Failed to unlock account:', error);
      throw error;
    }
  },
}));

