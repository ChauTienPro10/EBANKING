import logsData from "@/data/logs.json";

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  userId?: string;
  role: "Admin" | "Manager" | "Staff";
  action: string;
  ip: string;
  device: string;
  result: "success" | "failed";
  details?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  filter?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const logData: SystemLog[] = logsData.logs.map((l) => ({
  id: l.id,
  timestamp: l.timestamp,
  user: l.userName,
  userId: l.userId,
  role: l.userRole as "Admin" | "Manager" | "Staff",
  action: l.action,
  ip: l.ipAddress,
  device: l.device,
  result: l.action.includes("Failed") || l.action.includes("Rejected") ? "failed" : "success",
  details: l.details,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLogs(params: PaginationParams): Promise<PaginatedResponse<SystemLog>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...logData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.user.toLowerCase().includes(searchLower) ||
        l.action.toLowerCase().includes(searchLower) ||
        l.id.toLowerCase().includes(searchLower)
    );
  }

  if (params.filter) {
    if (params.filter.role) {
      filtered = filtered.filter((l) => l.role === params.filter.role);
    }
    if (params.filter.action) {
      filtered = filtered.filter((l) => l.action === params.filter.action);
    }
    if (params.filter.result) {
      filtered = filtered.filter((l) => l.result === params.filter.result);
    }
    if (params.filter.fromDate && params.filter.toDate) {
      filtered = filtered.filter((l) => {
        const logDate = new Date(l.timestamp);
        return logDate >= new Date(params.filter.fromDate) && logDate <= new Date(params.filter.toDate);
      });
    }
  }

  if (params.sort) {
    filtered.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[params.sort!.field];
      const bVal = (b as Record<string, unknown>)[params.sort!.field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return params.sort!.direction === "asc" ? comparison : -comparison;
    });
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;
  const paginated = filtered.slice(start, end);

  return {
    data: paginated,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function getLogById(id: string): Promise<SystemLog | null> {
  await delay(200);
  return logData.find((l) => l.id === id) || null;
}

