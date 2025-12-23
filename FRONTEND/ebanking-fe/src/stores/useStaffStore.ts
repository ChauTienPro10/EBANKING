import { create } from "zustand";
import * as adminStaffService from "@/services/adminStaffService";
import type { AdminDto } from "@/services/adminStaffService";

interface StaffStore {
  data: AdminDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number; // 1-based
    limit: number;
    total: number; // total elements
  };
  filters: {
    search: string;
    role?: "ROLE_ADMIN" | "ROLE_STAFF";
    active?: boolean;
  };

  // Actions
  fetchStaff: () => Promise<void>;
  createStaff: (payload: { username: string; fullName: string; role: AdminDto["role"]; password: string }) => Promise<void>;
  updateStaff: (id: number, updates: { fullName: string; role: AdminDto["role"]; active: boolean }) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<StaffStore["filters"]>) => void;
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
      const { pagination, filters } = get();
      const response = await adminStaffService.listAdmins({
        page: pagination.page,
        size: pagination.limit,
        search: filters.search || undefined,
        role: filters.role,
        active: filters.active,
      });
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

  createStaff: async (payload) => {
    set({ loading: true, error: null });
    try {
      await adminStaffService.createAdmin({
        username: payload.username,
        fullName: payload.fullName,
        role: payload.role,
        password: payload.password,
      });
      await get().fetchStaff();
      set({ loading: false });  // Reset loading on success
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateStaff: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await adminStaffService.updateAdmin(id, {
        fullName: updates.fullName,
        role: updates.role,
        active: updates.active,
      });
      await get().fetchStaff();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      await adminStaffService.deactivateAdmin(id);
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

  resetFilters: () => {
    set({
      filters: { search: "" },
      pagination: { page: 1, limit: 10, total: 0 },
    });
  },
}));
