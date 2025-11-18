import { create } from "zustand";
import {
  fetchUsers,
  getNotificationDetail,
  getNotificationHistory,
  sendNotification,
  type NotificationDetail,
  type NotificationHistoryItem,
  type ReceiverMode,
  type SendNotificationPayload,
  type User,
} from "@/services/mock/notificationService";

export interface NotificationFormData {
  mode: ReceiverMode;
  selectedUsers: User[];
  title: string;
  body: string;
  image?: string;
  link?: string;
  priority: "low" | "normal" | "high";
  scheduleTime?: string;
}

export interface NotificationFilters {
  staff?: string;
  status?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface NotificationState {
  users: User[];
  userSearch: string;
  history: NotificationHistoryItem[];
  totalHistory: number;
  page: number;
  pageSize: number;
  filters: NotificationFilters;
  form: NotificationFormData;
  errors: Record<string, string>;
  previewOpen: boolean;
  confirmOpen: boolean;
  detailOpen: boolean;
  detail?: NotificationDetail;
  toastMessage?: string;
  loadingSend: boolean;
  loadingHistory: boolean;
  loadUsers: (search?: string) => Promise<void>;
  setUserSearch: (value: string) => void;
  toggleUserSelection: (user: User) => void;
  removeUser: (userId: string) => void;
  setMode: (mode: ReceiverMode) => void;
  setFormValue: (field: keyof NotificationFormData, value: string | User[] | undefined) => void;
  uploadImage: (file: File | null) => Promise<void>;
  validateForm: () => boolean;
  openPreview: () => void;
  closePreview: () => void;
  openConfirm: () => void;
  closeConfirm: () => void;
  loadHistory: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  send: (staff?: string) => Promise<void>;
  selectNotification: (id: string) => Promise<void>;
  closeDetail: () => void;
  dismissToast: () => void;
}

const defaultForm: NotificationFormData = {
  mode: "single",
  selectedUsers: [],
  title: "",
  body: "",
  image: "",
  link: "",
  priority: "normal",
  scheduleTime: "",
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  users: [],
  userSearch: "",
  history: [],
  totalHistory: 0,
  page: 1,
  pageSize: 10,
  filters: { staff: "all", status: "all", keyword: "" },
  form: defaultForm,
  errors: {},
  previewOpen: false,
  confirmOpen: false,
  detailOpen: false,
  detail: undefined,
  toastMessage: undefined,
  loadingSend: false,
  loadingHistory: false,
  loadUsers: async (search) => {
    const users = await fetchUsers(search);
    set({ users });
  },
  setUserSearch: (value) => set({ userSearch: value }),
  toggleUserSelection: (user) => {
    set((state) => {
      const selected = state.form.selectedUsers;
      const exists = selected.find((u) => u.id === user.id);
      let nextSelected: User[];
      if (state.form.mode === "single") {
        nextSelected = exists ? [] : [user];
      } else {
        nextSelected = exists ? selected.filter((u) => u.id !== user.id) : [...selected, user];
      }
      return { form: { ...state.form, selectedUsers: nextSelected } };
    });
  },
  removeUser: (userId) =>
    set((state) => ({
      form: {
        ...state.form,
        selectedUsers: state.form.selectedUsers.filter((u) => u.id !== userId),
      },
    })),
  setMode: (mode) =>
    set((state) => ({
      form: {
        ...state.form,
        mode,
        selectedUsers: mode === "broadcast" ? [] : state.form.selectedUsers.slice(0, mode === "single" ? 1 : undefined),
      },
    })),
  setFormValue: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
      errors: { ...state.errors, [field as string]: "" },
    })),
  uploadImage: async (file) => {
    if (!file) {
      set((state) => ({ form: { ...state.form, image: "" } }));
      return;
    }
    const base64 = await fileToBase64(file);
    set((state) => ({ form: { ...state.form, image: base64 as string } }));
  },
  validateForm: () => {
    const { form } = get();
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "notifications.errors.titleRequired";
    if (!form.body.trim()) errors.body = "notifications.errors.bodyRequired";
    if (form.mode !== "broadcast" && form.selectedUsers.length === 0) {
      errors.receivers = "notifications.errors.receiversRequired";
    }
    if (form.scheduleTime) {
      const scheduleDate = new Date(form.scheduleTime);
      if (scheduleDate < new Date()) {
        errors.scheduleTime = "notifications.errors.scheduleFuture";
      }
    }
    set({ errors });
    return Object.keys(errors).length === 0;
  },
  openPreview: () => {
    if (get().validateForm()) {
      set({ previewOpen: true });
    }
  },
  closePreview: () => set({ previewOpen: false }),
  openConfirm: () => {
    if (get().validateForm()) {
      set({ confirmOpen: true });
    }
  },
  closeConfirm: () => set({ confirmOpen: false }),
  loadHistory: async () => {
    set({ loadingHistory: true });
    const { page, pageSize, filters } = get();
    const { data, total } = await getNotificationHistory({
      page,
      pageSize,
      staff: filters.staff,
      status: filters.status,
      keyword: filters.keyword,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    set({ history: data, totalHistory: total, loadingHistory: false });
  },
  setPage: (page) => {
    set({ page });
    void get().loadHistory();
  },
  setFilters: (partial) => {
    set((state) => ({
      filters: { ...state.filters, ...partial },
      page: 1,
    }));
    void get().loadHistory();
  },
  send: async (staff) => {
    if (!get().validateForm()) return;
    set({ loadingSend: true });
    const { form } = get();
    const payload: SendNotificationPayload = {
      receivers: form.selectedUsers.map((u) => u.id),
      mode: form.mode,
      title: form.title,
      body: form.body,
      image: form.image,
      link: form.link,
      priority: form.priority,
      scheduleTime: form.scheduleTime || null,
    };
    try {
      await sendNotification(payload, staff);
      set({
        toastMessage: "notifications.toast.success",
        confirmOpen: false,
        previewOpen: false,
        form: { ...defaultForm },
        loadingSend: false,
      });
      void get().loadHistory();
    } catch (error) {
      console.error(error);
      set({
        loadingSend: false,
        toastMessage: "notifications.toast.error",
      });
    }
  },
  selectNotification: async (id) => {
    const detail = await getNotificationDetail(id);
    set({ detail, detailOpen: true });
  },
  closeDetail: () => set({ detailOpen: false, detail: undefined }),
  dismissToast: () => set({ toastMessage: undefined }),
}));

async function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


