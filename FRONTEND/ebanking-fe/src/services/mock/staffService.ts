import usersData from "@/data/users.json";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Staff";
  department: string;
  status: "Active" | "Locked";
  createdAt: string;
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

const staffData: Staff[] = usersData.internalUsers.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role as "Admin" | "Manager" | "Staff",
  department: u.department,
  status: u.status as "Active" | "Locked",
  createdAt: u.createdAt,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStaff(params: PaginationParams): Promise<PaginatedResponse<Staff>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...staffData];

  // Search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.phone.includes(searchLower)
    );
  }

  // Filters
  if (params.filter) {
    if (params.filter.role) {
      filtered = filtered.filter((s) => s.role === params.filter.role);
    }
    if (params.filter.status) {
      filtered = filtered.filter((s) => s.status === params.filter.status);
    }
    if (params.filter.department) {
      filtered = filtered.filter((s) => s.department === params.filter.department);
    }
  }

  // Sort
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

export async function createStaff(staff: Omit<Staff, "id" | "createdAt">): Promise<Staff> {
  await delay(400 + Math.random() * 400);

  const newStaff: Staff = {
    ...staff,
    id: `IU${String(staffData.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };

  staffData.push(newStaff);
  return newStaff;
}

export async function updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
  await delay(400 + Math.random() * 400);

  const index = staffData.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Staff not found");

  staffData[index] = { ...staffData[index], ...updates };
  return staffData[index];
}

export async function deleteStaff(id: string): Promise<void> {
  await delay(300 + Math.random() * 300);

  const index = staffData.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Staff not found");

  staffData.splice(index, 1);
}

export async function getStaffById(id: string): Promise<Staff | null> {
  await delay(200);
  return staffData.find((s) => s.id === id) || null;
}

