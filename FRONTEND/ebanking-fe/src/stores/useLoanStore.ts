import { create } from "zustand";
import * as loanService from "@/services/mock/loanService";
import type { Loan, PaginationParams, PaginatedResponse } from "@/services/mock/loanService";

interface LoanStore {
  data: Loan[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    status?: string;
    productType?: string;
    customerId?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };

  fetchLoans: () => Promise<void>;
  createLoan: (loan: Omit<Loan, "id" | "loanId" | "createdAt">) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  approveLoan: (id: string, approvedBy: string) => Promise<void>;
  rejectLoan: (id: string, approvedBy: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<LoanStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useLoanStore = create<LoanStore>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: "",
  },
  sort: undefined,

  fetchLoans: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          ...(filters.status && { status: filters.status }),
          ...(filters.productType && { productType: filters.productType }),
          ...(filters.customerId && { customerId: filters.customerId }),
        },
        sort,
      };
      const response: PaginatedResponse<Loan> = await loanService.getLoans(params);
      set({
        data: response.data,
        pagination: {
          ...pagination,
          total: response.total,
        },
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createLoan: async (loan) => {
    set({ loading: true, error: null });
    try {
      await loanService.createLoan(loan);
      await get().fetchLoans();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateLoan: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await loanService.updateLoan(id, updates);
      await get().fetchLoans();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteLoan: async (id) => {
    set({ loading: true, error: null });
    try {
      await loanService.deleteLoan(id);
      await get().fetchLoans();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  approveLoan: async (id, approvedBy) => {
    set({ loading: true, error: null });
    try {
      await loanService.approveLoan(id, approvedBy);
      await get().fetchLoans();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  rejectLoan: async (id, approvedBy) => {
    set({ loading: true, error: null });
    try {
      await loanService.rejectLoan(id, approvedBy);
      await get().fetchLoans();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  setLimit: (limit) => {
    set((state) => ({
      pagination: { ...state.pagination, limit, page: 1 },
    }));
  },

  setSearch: (search) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setFilter: (filter) => {
    set((state) => ({
      filters: { ...state.filters, ...filter },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setSort: (sort) => {
    set({ sort });
  },

  resetFilters: () => {
    set({
      filters: { search: "" },
      pagination: { page: 1, limit: 10, total: 0 },
      sort: undefined,
    });
  },
}));






