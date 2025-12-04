import { create } from "zustand";
import * as staffService from "@/services/mock/staffService";
import type { Staff, PaginationParams, PaginatedResponse } from "@/services/mock/staffService";

interface StaffStore {
  data: Staff[];
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
    status?: string;
    department?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };

  // Actions
  fetchStaff: () => Promise<void>;
  createStaff: (staff: Omit<Staff, "id" | "createdAt">) => Promise<void>;
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<StaffStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useStaffStore = create<StaffStore>((set, get) => ({
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

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          ...(filters.role && { role: filters.role }),
          ...(filters.status && { status: filters.status }),
          ...(filters.department && { department: filters.department }),
        },
        sort,
      };
      const response: PaginatedResponse<Staff> = await staffService.getStaff(params);
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

  createStaff: async (staff) => {
    set({ loading: true, error: null });
    try {
      await staffService.createStaff(staff);
      await get().fetchStaff();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateStaff: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await staffService.updateStaff(id, updates);
      await get().fetchStaff();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      await staffService.deleteStaff(id);
      await get().fetchStaff();
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







