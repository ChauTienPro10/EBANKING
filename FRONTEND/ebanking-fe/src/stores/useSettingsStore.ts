import { create } from "zustand";
import * as settingsService from "@/services/mock/settingsService";
import type { SystemSettings } from "@/services/mock/settingsService";

interface SettingsStore {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  updateGeneral: (updates: Partial<SystemSettings["general"]>) => Promise<void>;
  updateSecurity: (updates: Partial<SystemSettings["security"]>) => Promise<void>;
  updateBankingLimits: (updates: Partial<SystemSettings["bankingLimits"]>) => Promise<void>;
  updateNotifications: (updates: Partial<SystemSettings["notifications"]>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.getSettings();
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.updateSettings(updates);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateGeneral: async (updates) => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.updateGeneralSettings(updates);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateSecurity: async (updates) => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.updateSecuritySettings(updates);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBankingLimits: async (updates) => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.updateBankingLimits(updates);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateNotifications: async (updates) => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.updateNotificationSettings(updates);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));

