import { create } from "zustand";
import * as customerService from "@/services/mock/customerService";
import type { Customer, PaginationParams, PaginatedResponse } from "@/services/mock/customerService";

interface CustomerStore {
  data: Customer[];
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
    kycStatus?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };

  fetchCustomers: () => Promise<void>;
  createCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<CustomerStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
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

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          ...(filters.status && { status: filters.status }),
          ...(filters.kycStatus && { kycStatus: filters.kycStatus }),
        },
        sort,
      };
      const response: PaginatedResponse<Customer> = await customerService.getCustomers(params);
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

  createCustomer: async (customer) => {
    set({ loading: true, error: null });
    try {
      await customerService.createCustomer(customer);
      await get().fetchCustomers();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await customerService.updateCustomer(id, updates);
      await get().fetchCustomers();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await customerService.deleteCustomer(id);
      await get().fetchCustomers();
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







