import { create } from "zustand";
import * as svc from "@/services/mock/notificationService";

export type ReceiverMode = svc.ReceiverMode;
export type Priority = svc.Priority;
export type HistoryStatus = svc.HistoryStatus;
export type SimpleUser = svc.SimpleUser;

interface FormState {
  mode: ReceiverMode;
  selectedUsers: SimpleUser[];
  title: string;
  body: string;
  image?: string | null;
  link?: string;
  priority: Priority;
  scheduleTime?: string | null;
}

interface ErrorsState {
  title?: string; // i18n key
  body?: string; // i18n key
  receivers?: string; // i18n key
  scheduleTime?: string; // i18n key
}

interface FiltersState {
  staff?: string;
  status?: HistoryStatus | "all";
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface NotificationStore {
  // Users
  users: SimpleUser[];
  userSearch: string;

  // Form
  form: FormState;
  errors: ErrorsState;

  // UI state
  previewOpen: boolean;
  confirmOpen: boolean;
  loadingSend: boolean;
  toastMessage: string | null; // i18n key

  // History
  history: Array<Pick<svc.HistoryItem, "id" | "time" | "staff" | "title" | "receiverCount" | "priority" | "status">>;
  totalHistory: number;
  page: number;
  pageSize: number;
  loadingHistory: boolean;
  filters: FiltersState;

  // Detail
  detailOpen: boolean;
  detail: svc.HistoryDetail | null;

  // Actions
  setUserSearch: (q: string) => void;
  setMode: (mode: ReceiverMode) => void;
  toggleUserSelection: (u: SimpleUser) => void;
  removeUser: (id: string) => void;
  setFormValue: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  uploadImage: (file: File | null) => void;
  openPreview: () => void;
  closePreview: () => void;
  openConfirm: () => void;
  closeConfirm: () => void;
  dismissToast: () => void;
  loadUsers: () => Promise<void>;
  validate: () => boolean;
  send: (role: "Admin" | "Manager" | "Staff") => Promise<void>;

  // History actions
  setFilters: (f: Partial<FiltersState>) => void;
  setPage: (page: number) => void;
  loadHistory: () => Promise<void>;
  selectNotification: (id: string) => Promise<void>;
  closeDetail: () => void;
}

const initialForm: FormState = {
  mode: "single",
  selectedUsers: [],
  title: "",
  body: "",
  image: null,
  link: "",
  priority: "normal",
  scheduleTime: null,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  users: [],
  userSearch: "",

  form: initialForm,
  errors: {},

  previewOpen: false,
  confirmOpen: false,
  loadingSend: false,
  toastMessage: null,

  history: [],
  totalHistory: 0,
  page: 1,
  pageSize: 10,
  loadingHistory: false,
  filters: { staff: "all", status: "all" },

  detailOpen: false,
  detail: null,

  setUserSearch: (q) => set({ userSearch: q }),
  setMode: (mode) => set((s) => ({ form: { ...s.form, mode, selectedUsers: mode === "broadcast" ? [] : s.form.selectedUsers } })),
  toggleUserSelection: (u) => set((s) => {
    const exists = s.form.selectedUsers.some((x) => x.id === u.id);
    const selectedUsers = exists
      ? s.form.selectedUsers.filter((x) => x.id !== u.id)
      : (s.form.mode === "single" ? [u] : [...s.form.selectedUsers, u]);
    return { form: { ...s.form, selectedUsers } };
  }),
  removeUser: (id) => set((s) => ({ form: { ...s.form, selectedUsers: s.form.selectedUsers.filter((u) => u.id !== id) } })),
  setFormValue: (key, value) => set((s) => ({ form: { ...s.form, [key]: value } })),
  uploadImage: async (file) => {
    if (!file) return set((s) => ({ form: { ...s.form, image: null } }));
    const reader = new FileReader();
    reader.onload = () => set((s) => ({ form: { ...s.form, image: String(reader.result) } }));
    reader.readAsDataURL(file);
  },
  openPreview: () => set({ previewOpen: true }),
  closePreview: () => set({ previewOpen: false }),
  openConfirm: () => {
    if (!get().validate()) return;
    set({ confirmOpen: true });
  },
  closeConfirm: () => set({ confirmOpen: false }),
  dismissToast: () => set({ toastMessage: null }),

  loadUsers: async () => {
    const users = await svc.listUsers();
    set({ users });
  },

  validate: () => {
    const { form } = get();
    const errors: ErrorsState = {};
    if (!form.title?.trim()) errors.title = "notifications.errors.titleRequired";
    if (!form.body?.trim()) errors.body = "notifications.errors.bodyRequired";
    if (form.mode !== "broadcast" && form.selectedUsers.length === 0) {
      errors.receivers = "notifications.errors.receiversRequired";
    }
    if (form.scheduleTime) {
      try {
        const dt = new Date(form.scheduleTime);
        if (isNaN(dt.getTime()) || dt.getTime() <= Date.now()) {
          errors.scheduleTime = "notifications.errors.scheduleFuture";
        }
      } catch {
        errors.scheduleTime = "notifications.errors.scheduleFuture";
      }
    }
    set({ errors });
    return Object.keys(errors).length === 0;
  },

  send: async (role) => {
    if (!get().validate()) return;
    set({ loadingSend: true });
    try {
      const { form } = get();
      await svc.send({
        title: form.title,
        body: form.body,
        image: form.image || undefined,
        link: form.link,
        priority: form.priority,
        scheduleTime: form.scheduleTime || undefined,
        mode: form.mode,
        receivers: form.selectedUsers,
        staff: role,
      });
      set({ toastMessage: "notifications.toast.success", loadingSend: false, confirmOpen: false, form: { ...initialForm } });
      await get().loadHistory();
    } catch (e) {
      set({ toastMessage: "notifications.toast.error", loadingSend: false });
    }
  },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 1 })),
  setPage: (page) => set({ page }),

  loadHistory: async () => {
    set({ loadingHistory: true });
    const { page, pageSize, filters } = get();
    const res = await svc.listHistory({ page, size: pageSize, staff: filters.staff, status: filters.status, keyword: filters.keyword, dateFrom: filters.dateFrom, dateTo: filters.dateTo });
    set({ history: res.content, totalHistory: res.total, loadingHistory: false });
  },

  selectNotification: async (id) => {
    const detail = await svc.getDetail(id);
    set({ detailOpen: !!detail, detail });
  },
  closeDetail: () => set({ detailOpen: false, detail: null }),
}));

