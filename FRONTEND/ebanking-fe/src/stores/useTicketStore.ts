import { create } from "zustand";
import * as ticketService from "@/services/mock/ticketService";
import type { Ticket, PaginationParams, PaginatedResponse } from "@/services/mock/ticketService";

interface TicketStore {
  data: Ticket[];
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
    category?: string;
    priority?: string;
  };
  sort?: { field: string; direction: "asc" | "desc" };

  fetchTickets: () => Promise<void>;
  createTicket: (ticket: Omit<Ticket, "id" | "ticketId" | "createdAt" | "lastUpdated">) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addMessage: (id: string, message: Omit<Ticket["messages"][0], "id" | "timestamp">) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: Partial<TicketStore["filters"]>) => void;
  setSort: (sort?: { field: string; direction: "asc" | "desc" }) => void;
  resetFilters: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
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

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination, filters, sort } = get();
      const params: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: {
          ...(filters.status && { status: filters.status }),
          ...(filters.category && { category: filters.category }),
          ...(filters.priority && { priority: filters.priority }),
        },
        sort,
      };
      const response: PaginatedResponse<Ticket> = await ticketService.getTickets(params);
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

  createTicket: async (ticket) => {
    set({ loading: true, error: null });
    try {
      await ticketService.createTicket(ticket);
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateTicket: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await ticketService.updateTicket(id, updates);
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      await ticketService.deleteTicket(id);
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  addMessage: async (id, message) => {
    set({ loading: true, error: null });
    try {
      await ticketService.addTicketMessage(id, message);
      await get().fetchTickets();
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






