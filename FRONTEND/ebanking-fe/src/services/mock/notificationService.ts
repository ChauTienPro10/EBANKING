import customersData from "@/data/users.json";

export type ReceiverMode = "single" | "multi" | "broadcast";
export type Priority = "low" | "normal" | "high";
export type HistoryStatus = "success" | "failed" | "scheduled";

export interface SimpleUser { id: string; name: string; email: string; phone: string }

export interface SendPayload {
  title: string;
  body: string;
  image?: string | null;
  link?: string;
  priority: Priority;
  scheduleTime?: string | null;
  mode: ReceiverMode;
  receivers: SimpleUser[];
  staff: string; 
}

export interface HistoryItem {
  id: string;
  time: string;
  staff: string;
  title: string;
  receiverCount: number;
  priority: Priority;
  status: HistoryStatus;
}

export interface HistoryDetail extends HistoryItem {
  body: string;
  image?: string | null;
  link?: string;
  scheduleTime?: string | null;
  receivers: Array<SimpleUser & { status: "delivered" | "failed" | "pending" }>
}

const LS_KEY = "ebank_notif_history";

function getAllCustomers(): SimpleUser[] {
  // load demo customers from json
  const list = (customersData as any).customers as Array<any>;
  return list.map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone }));
}

function readHistory(): HistoryDetail[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as HistoryDetail[]; } catch { return []; }
}

function writeHistory(items: HistoryDetail[]) { localStorage.setItem(LS_KEY, JSON.stringify(items)); }

export async function listUsers(): Promise<SimpleUser[]> { return getAllCustomers(); }

export async function listHistory(params: { page: number; size: number; staff?: string; status?: HistoryStatus | "all"; keyword?: string; dateFrom?: string; dateTo?: string; }) {
  const all = readHistory();
  const filtered = all.filter((h) => {
    if (params.staff && params.staff !== "all" && h.staff !== params.staff) return false;
    if (params.status && params.status !== "all" && h.status !== params.status) return false;
    if (params.keyword && !h.title.toLowerCase().includes(params.keyword.toLowerCase())) return false;
    if (params.dateFrom && new Date(h.time) < new Date(params.dateFrom)) return false;
    if (params.dateTo && new Date(h.time) > new Date(params.dateTo + "T23:59:59")) return false;
    return true;
  });
  const total = filtered.length;
  const start = (params.page - 1) * params.size;
  const pageData = filtered.slice(start, start + params.size).map(h => ({
    id: h.id, time: h.time, staff: h.staff, title: h.title, receiverCount: h.receiverCount, priority: h.priority, status: h.status,
  }));
  return { content: pageData, total };
}

export async function getDetail(id: string): Promise<HistoryDetail | null> {
  const all = readHistory();
  return all.find((h) => h.id === id) || null;
}

export async function send(payload: SendPayload): Promise<{ id: string }>
{
  const id = `N${Date.now()}`;
  const nowIso = new Date().toISOString();
  const scheduled = payload.scheduleTime && new Date(payload.scheduleTime) > new Date();
  const detail: HistoryDetail = {
    id,
    time: nowIso,
    staff: payload.staff,
    title: payload.title,
    receiverCount: payload.mode === "broadcast" ? getAllCustomers().length : payload.receivers.length,
    priority: payload.priority,
    status: scheduled ? "scheduled" : "success",
    body: payload.body,
    image: payload.image || undefined,
    link: payload.link,
    scheduleTime: payload.scheduleTime || undefined,
    receivers:
      (payload.mode === "broadcast" ? getAllCustomers() : payload.receivers).map((u) => ({
        ...u,
        status: scheduled ? "pending" : Math.random() > 0.9 ? "failed" : "delivered",
      })),
  };
  const all = readHistory();
  all.unshift(detail);
  writeHistory(all);
  return { id };
}

