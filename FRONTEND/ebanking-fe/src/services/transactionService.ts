import apiClient from './api';

// Match the backend DTOs
export interface Transaction {
  transactionId: string | number;
  senderAccountNumber: string;
  receiverAccountNumber: string | null;
  amount: number;
  currency: string;
  transactionType: string;
  description?: string;
  status: string;
  transactionAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string; // Will be mapped to username/sender
  filter?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' };
}

// Backend returns custom TransactionListResponse, not Spring Page<T>
export interface TransactionListResponse {
  transactions: TransactionInfo[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface TransactionInfo {
  transactionId: number;
  senderAccountNumber: string;
  receiverAccountNumber: string | null;
  amount: string; // Backend returns as string
  currency: string;
  transactionType: string;
  description?: string;
  status: string;
  transactionAt: string;
}

// Normalized response for internal use
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// Convert backend response to normalized format
function convertTransactionListResponse(
  response: TransactionListResponse
): PaginatedResponse<Transaction> {
  const rawTotal =
    (response as any).totalCount ??
    (response as any).totalElements ??
    0;
  const total = Number.isFinite(rawTotal) ? Number(rawTotal) : 0;
  const rawLimit = (response as any).limit ?? (response as any).size ?? 10;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Number(rawLimit) : 10;
  const rawPage = (response as any).page ?? (response as any).number ?? 0; // backend may be 0-based
  const pageNumber = Number.isFinite(rawPage) ? Number(rawPage) : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit || 1));

  return {
    content: response.transactions.map(tx => ({
      transactionId: String(tx.transactionId),
      senderAccountNumber: tx.senderAccountNumber,
      receiverAccountNumber: tx.receiverAccountNumber,
      amount: parseFloat(tx.amount) || 0, // Convert string to number
      currency: tx.currency,
      transactionType: tx.transactionType,
      description: tx.description,
      status: tx.status,
      transactionAt: tx.transactionAt,
    })),
    totalElements: total,
    totalPages,
    number: pageNumber + 1, // convert to 1-based for UI
    size: limit,
  };
}

export async function getTransactions(params: PaginationParams): Promise<PaginatedResponse<Transaction>> {
  const { page, limit, search, filter } = params;

  const queryParams = new URLSearchParams({
    page: (page - 1).toString(), // Backend uses 0-indexed
    size: limit.toString(),
  });

  if (search) {
    queryParams.append('search', search);
  }

  if (filter) {
    if (filter.fromDate) {
      queryParams.append('fromDate', filter.fromDate);
    }
    if (filter.toDate) {
      queryParams.append('toDate', filter.toDate);
    }
    if (filter.type) {
      queryParams.append('type', filter.type);
    }
    if (filter.status) {
      queryParams.append('status', filter.status);
    }
  }

  const response = await apiClient.get<TransactionListResponse>(`/transactions?${queryParams.toString()}`);
  return convertTransactionListResponse(response.data);
}




