import apiClient from './api';

// Corresponds to AuditLog entity in backend
export interface AuditLog {
  id: number;
  staffUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  success: boolean;
  ipAddress: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  username?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const getAuditLogs = (params: PaginationParams) => {
  const queryParams = new URLSearchParams({
    page: (params.page - 1).toString(),
    size: params.size.toString(),
  });

  let url = '';
  if (params.username) {
    url = `/audit-logs/staff/${params.username}?${queryParams.toString()}`;
  } else if (params.startDate && params.endDate) {
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    url = `/audit-logs/date-range?${queryParams.toString()}`;
  } else {
    url = `/audit-logs?${queryParams.toString()}`;
  }

  console.log('API URL:', url);
  return apiClient.get<PaginatedResponse<AuditLog>>(url);
};

