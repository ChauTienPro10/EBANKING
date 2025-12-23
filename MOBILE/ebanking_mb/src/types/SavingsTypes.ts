// Backend DTO structure
export interface SavingsAccountDto {
  savingsAccountId: number;
  accountNumber: string;
  userId: number;
  paymentAccountId: number;
  paymentAccountNumber: string;
  balance: number;
  currency: string;
  interestRateId: number;
  annualRate: number;
  termMonths: number;
  status: string;
  openedDate: string;
  maturityDate: string;
  closedDate?: string;
  totalInterestEarned: number;
  createdAt: string;
  updatedAt: string;
}

// Frontend interface
export interface SavingsAccount {
  id: string;
  accountNumber: string;
  accountName?: string; // Optional since removed from creation
  balance: number;
  interestRate: number;
  termType?: SavingsTermType; // Optional since we might not always have full term details
  termMonths: number; // số tháng
  openDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
  autoRenewal?: boolean; // Optional since removed from creation
  linkedTransactionAccount: string;
  currency?: string;
  totalInterestEarned?: number;
  closedDate?: string;
  updatedAt?: string; // For showing closure time when status is CLOSED
}

export interface SavingsTermType {
  interestRateId: number;
  name: string;
  termMonths: number; // số tháng
  annualRate: number; // lãi suất năm
  minAmount: number;
  maxAmount: number;
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
  description?: string;
}

// Backend Cash Request Response DTO
export interface CashRequestResponseDto {
  requestId: number;
  requestNumber: string;
  userId: number;
  savingsAccountId: number;
  savingsAccountNumber: string;
  requestType: 'CASH_DEPOSIT' | 'CASH_WITHDRAWAL';
  amount: number;
  currency: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

// Frontend interface
export interface SavingsRequest {
  id: string;
  requestNumber: string;
  savingsAccountId: string;
  savingsAccountNumber: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  processedDate?: string;
  processedBy?: string;
  note?: string;
}

export interface CreateSavingsAccountRequest {
  userId: number;
  paymentAccountId: number;
  initialAmount: number;
  currency: string;
  interestRateId: number;
  termMonths: number;
}

// Backend Cash Transaction Request DTO
export interface CashTransactionRequest {
  userId: number;
  username: string;
  savingsAccountId: number;
  requestType: 'CASH_DEPOSIT' | 'CASH_WITHDRAWAL';
  amount: number;
  currency: string;
  description?: string;
}

export interface CreateSavingsRequestData {
  savingsAccountId: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  note?: string;
}

// Backend Transfer Request DTO
export interface TransferRequest {
  userId: number;
  username: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  currency: string;
  description?: string;
  transferType: 'PAYMENT_TO_SAVINGS' | 'SAVINGS_TO_PAYMENT';
}

export interface SavingsTransfer {
  fromAccount: string;
  toAccount: string;
  amount: number;
  type: 'TO_SAVINGS' | 'FROM_SAVINGS';
  note?: string;
}