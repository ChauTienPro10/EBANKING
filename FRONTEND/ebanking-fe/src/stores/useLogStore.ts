import { create } from "zustand";
import * as logService from "@/services/mock/logService";
import type { SystemLog, PaginationParams, PaginatedResponse } from "@/services/mock/logService";

interface LogStore {
  data: SystemLog[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    role?: string;
    action?: string;
    result?: string;
    fromDate?: string;
    toDate?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };

  fetchLogs: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<LogStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useLogStore = create<LogStore>((set, get) => ({
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

  fetchLogs: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          ...(filters.role && { role: filters.role }),
          ...(filters.action && { action: filters.action }),
          ...(filters.result && { result: filters.result }),
          ...(filters.fromDate && filters.toDate && { fromDate: filters.fromDate, toDate: filters.toDate }),
        },
        sort,
      };
      const response: PaginatedResponse<SystemLog> = await logService.getLogs(params);
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






