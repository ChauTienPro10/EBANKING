import { create } from "zustand";
import * as svc from "@/services/mock/accountService";

export interface AccountFilters {
  search: string;
  status?: svc.AccountStatus | "all";
}

interface AccountStore {
  data: svc.EnrichedAccount[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  filters: AccountFilters;

  selected?: svc.EnrichedAccount | null;

  // actions
  setPage: (p: number) => void;
  setLimit: (n: number) => void;
  setFilters: (f: Partial<AccountFilters>) => void;
  fetch: () => Promise<void>;
  openDetail: (id: string) => Promise<void>;
  closeDetail: () => void;
  lock: (params: { id: string; reason: string; until?: string | null }) => Promise<void>;
  unlock: (id: string) => Promise<void>;
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
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 1 })),

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const all = await svc.listAccounts();
      const { search, status } = get().filters;
      const filtered = all.filter((a) => {
        const okStatus = status === "all" || a.status === status;
        const term = search.trim().toLowerCase();
        const okSearch = !term || a.id.toLowerCase().includes(term) || a.ownerName.toLowerCase().includes(term);
        return okStatus && okSearch;
      });
      const { page, limit } = get();
      const start = (page - 1) * limit;
      const pageData = filtered.slice(start, start + limit);
      set({ data: pageData, total: filtered.length, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  openDetail: async (id) => {
    const acc = await svc.getAccount(id);
    set({ selected: acc || null });
  },
  closeDetail: () => set({ selected: null }),

  lock: async ({ id, reason, until }) => {
    await svc.lockAccount(id, reason, until);
    await get().fetch();
    const sel = await svc.getAccount(id);
    set({ selected: sel || null });
  },
  unlock: async (id) => {
    await svc.unlockAccount(id);
    await get().fetch();
    const sel = await svc.getAccount(id);
    set({ selected: sel || null });
  },
}));

