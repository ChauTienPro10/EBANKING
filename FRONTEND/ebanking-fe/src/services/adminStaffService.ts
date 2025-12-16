import apiClient from "./api";

export type Role = "ROLE_ADMIN" | "ROLE_STAFF";

export interface AdminDto {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-based)
  size: number;
}

export interface ListParams {
  page: number; // 1-based from UI
  size: number;
  search?: string;
  role?: Role;
  active?: boolean;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface UpdateAdminRequest {
  fullName: string;
  role: Role;
  active: boolean;
}

export const listAdmins = async (params: ListParams) => {
  const query = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.search) query.append("search", params.search);
  if (params.role) query.append("role", params.role);
  if (typeof params.active === "boolean") query.append("active", String(params.active));
  const res = await apiClient.get<PaginatedResponse<AdminDto>>(`/admins?${query.toString()}`);
  return res.data;
};

export const createAdmin = async (payload: CreateAdminRequest) => {
  const res = await apiClient.post<AdminDto>("/admins", payload);
  return res.data;
};

export const updateAdmin = async (id: number, payload: UpdateAdminRequest) => {
  const res = await apiClient.put<AdminDto>(`/admins/${id}`, payload);
  return res.data;
};

export const deactivateAdmin = async (id: number) => {
  await apiClient.delete(`/admins/${id}`);
};

export const resetPassword = async (id: number, newPassword: string) => {
  await apiClient.post(`/admins/${id}/reset-password`, { newPassword });
};

export const changeOwnPassword = async (oldPassword: string, newPassword: string) => {
  await apiClient.post(`/admins/change-password`, { oldPassword, newPassword });
};

