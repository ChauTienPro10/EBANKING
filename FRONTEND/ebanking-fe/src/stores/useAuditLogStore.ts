import { create } from "zustand";
import * as logService from "@/services/logService";
import type { AuditLog, PaginationParams } from "@/services/logService";

interface AuditLogStore {
  data: AuditLog[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    username?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    action?: string;
    ip?: string;
    role?: string;
  };
  selectedLog: AuditLog | null;

  fetchLogs: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilter: (filter: Partial<AuditLogStore['filters']>) => void;
  resetFilters: () => void;
  selectLog: (log: AuditLog | null) => void;
}

export const useAuditLogStore = create<AuditLogStore>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {},
  selectedLog: null,

  fetchLogs: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters } = get();
      const params: PaginationParams = {
        page: pagination.page,
        size: pagination.limit,
        username: filters.username,
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        action: filters.action,
        ip: filters.ip,
        role: filters.role,
      };
      console.log('Calling API with params:', params);
      const response = await logService.getAuditLogs(params);
      console.log('API Response:', response);
      const responseData = response.data;
      set({
        data: responseData.content,
        pagination: {
          ...pagination,
          total: responseData.totalElements,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
  },

  setLimit: (limit) => {
    set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } }));
  },

  setFilter: (filter) => {
    set((state) => ({ filters: { ...state.filters, ...filter }, pagination: { ...state.pagination, page: 1 } }));
  },

  resetFilters: () => {
    set({ filters: {}, pagination: { page: 1, limit: 10, total: 0 } });
  },

  selectLog: (log) => set({ selectedLog: log }),
}));

