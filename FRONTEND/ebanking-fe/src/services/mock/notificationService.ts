export type ReceiverMode = "single" | "multi" | "broadcast";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface SendNotificationPayload {
  receivers: string[];
  mode: ReceiverMode;
  title: string;
  body: string;
  image?: string;
  link?: string;
  priority: "low" | "normal" | "high";
  scheduleTime?: string | null;
}

export interface NotificationHistoryItem {
  id: string;
  time: string;
  staff: string;
  title: string;
  receiverCount: number;
  status: "success" | "failed" | "scheduled";
  priority?: "low" | "normal" | "high";
  scheduleTime?: string | null;
}

export interface ReceiverStatus {
  id: string;
  name: string;
  status: "delivered" | "failed" | "pending";
}

export interface NotificationDetail extends NotificationHistoryItem {
  body: string;
  image?: string;
  link?: string;
  receivers: ReceiverStatus[];
}

const mockUsers: User[] = [
  { id: "u01", name: "Nguyễn Văn A", phone: "0912345678", email: "a@example.com" },
  { id: "u02", name: "Trần Thị B", phone: "0987654321", email: "b@example.com" },
  { id: "u03", name: "Lê Minh C", phone: "0909123123", email: "c@example.com" },
];

let notificationHistory: NotificationHistoryItem[] = [
  {
    id: "nt001",
    time: "2025-01-18T09:12",
    staff: "Pham Tuan",
    title: "Cập nhật bảo trì hệ thống",
    receiverCount: 30000,
    status: "success",
    priority: "normal",
  },
  {
    id: "nt002",
    time: "2025-01-18T11:50",
    staff: "Tran My",
    title: "Khuyến mãi Tết 20%",
    receiverCount: 1200,
    status: "failed",
    priority: "high",
  },
];

const notificationDetails: Record<string, NotificationDetail> = {
  nt001: {
    ...notificationHistory[0],
    body: "Vui lòng lưu ý thời gian bảo trì hệ thống từ 22:00 - 23:00.",
    image: "",
    link: "https://ebanking.example.com/maintenance",
    receivers: mockUsers.map((u) => ({ id: u.id, name: u.name, status: "delivered" })),
  },
  nt002: {
    ...notificationHistory[1],
    body: "Nhận ưu đãi 20% cho giao dịch đầu tiên trong ngày.",
    image: "",
    link: "https://ebanking.example.com/promo",
    receivers: mockUsers.map((u, idx) => ({
      id: u.id,
      name: u.name,
      status: idx === 1 ? "failed" : "delivered",
    })),
  },
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchUsers(search?: string): Promise<User[]> {
  await delay();
  if (!search) return mockUsers;
  const term = search.toLowerCase();
  return mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(term) ||
      u.phone.includes(term) ||
      u.email.toLowerCase().includes(term)
  );
}

export interface HistoryParams {
  page: number;
  pageSize: number;
  staff?: string;
  status?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getNotificationHistory(params: HistoryParams) {
  await delay();
  let data = [...notificationHistory];
  if (params.staff && params.staff !== "all") {
    data = data.filter((item) => item.staff === params.staff);
  }
  if (params.status && params.status !== "all") {
    data = data.filter((item) => item.status === params.status);
  }
  if (params.keyword) {
    const term = params.keyword.toLowerCase();
    data = data.filter((item) => item.title.toLowerCase().includes(term));
  }
  if (params.dateFrom) {
    data = data.filter((item) => item.time >= params.dateFrom);
  }
  if (params.dateTo) {
    data = data.filter((item) => item.time <= params.dateTo);
  }
  const total = data.length;
  const start = (params.page - 1) * params.pageSize;
  return {
    data: data.slice(start, start + params.pageSize),
    total,
  };
}

export async function sendNotification(payload: SendNotificationPayload, staff = "System") {
  await delay();
  const notificationId =
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `nt-${Date.now()}`;
  const receiverCount =
    payload.mode === "broadcast"
      ? 30000
      : payload.receivers.length > 0
      ? payload.receivers.length
      : 1;

  const historyItem: NotificationHistoryItem = {
    id: notificationId,
    time: payload.scheduleTime ?? new Date().toISOString().slice(0, 16),
    staff,
    title: payload.title,
    receiverCount,
    status: payload.scheduleTime ? "scheduled" : "success",
    priority: payload.priority,
    scheduleTime: payload.scheduleTime,
  };

  notificationHistory = [historyItem, ...notificationHistory];
  notificationDetails[notificationId] = {
    ...historyItem,
    body: payload.body,
    image: payload.image,
    link: payload.link,
    receivers:
      payload.mode === "broadcast"
        ? mockUsers.map((u) => ({ id: u.id, name: u.name, status: "pending" }))
        : payload.receivers.map((id) => {
            const user = mockUsers.find((u) => u.id === id);
            return {
              id,
              name: user?.name ?? "Unknown",
              status: payload.scheduleTime ? "pending" : "delivered",
            };
          }),
  };

  return { status: "success" as const, notificationId };
}

export async function getNotificationDetail(id: string) {
  await delay();
  return notificationDetails[id];
}


