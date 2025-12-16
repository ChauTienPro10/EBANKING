import { create } from "zustand";
import * as transactionService from "@/services/transactionService";
import type { Transaction, PaginationParams } from "@/services/transactionService";

interface TransactionStore {
  data: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    type?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };
  selectedTransaction: Transaction | null;

  fetchTransactions: () => Promise<void>;
  selectTransaction: (transaction: Transaction | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<TransactionStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
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
  selectedTransaction: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          type: filters.type,
          status: filters.status,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
        sort,
      };
      const response = await transactionService.getTransactions(params);
      set({
        data: response.content,
        pagination: {
          ...pagination,
          total: response.totalElements,
        },
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
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

  selectTransaction: (transaction) => set({ selectedTransaction: transaction }),
}));







