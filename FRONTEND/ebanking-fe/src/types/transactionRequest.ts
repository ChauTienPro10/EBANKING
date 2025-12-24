export interface TransactionRequest {
  requestId: number;
  requestNumber: string;
  userId: number;
  savingsAccountId: number;
  requestType: 'CASH_DEPOSIT' | 'CASH_WITHDRAWAL';
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  description?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRequestFilter {
  status?: string;
  requestType?: string;
  userId?: number;
  requestNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface ProcessTransactionRequest {
  requestId: number;
  action: 'APPROVE' | 'REJECT';
  adminUsername: string;
  rejectionReason?: string;
}