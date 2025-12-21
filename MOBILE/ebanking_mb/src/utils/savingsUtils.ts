import { SavingsTermType, SavingsAccountDto, SavingsAccount, CashRequestResponseDto, SavingsRequest } from '../types/SavingsTypes';

/**
 * Transform backend CashRequestResponseDto to frontend SavingsRequest
 */
export const transformCashRequestResponse = (dto: CashRequestResponseDto): SavingsRequest => {
  return {
    id: dto.requestId.toString(),
    requestNumber: dto.requestNumber,
    savingsAccountId: dto.savingsAccountId.toString(),
    savingsAccountNumber: dto.savingsAccountNumber,
    type: dto.requestType === 'CASH_DEPOSIT' ? 'DEPOSIT' : 'WITHDRAW',
    amount: dto.amount,
    requestDate: dto.requestedAt,
    status: dto.status,
    reason: dto.rejectionReason,
    processedDate: dto.processedAt,
    processedBy: dto.processedBy,
    note: dto.description,
  };
};
export const transformSavingsAccountDto = (dto: SavingsAccountDto): SavingsAccount => {
  return {
    id: dto.savingsAccountId.toString(),
    accountNumber: dto.accountNumber,
    accountName: `Tài khoản tiết kiệm ${dto.termMonths} tháng`, // Generate name based on term
    balance: dto.balance,
    interestRate: dto.annualRate,
    termMonths: dto.termMonths,
    openDate: dto.openedDate,
    maturityDate: dto.maturityDate,
    status: dto.status as 'ACTIVE' | 'MATURED' | 'CLOSED',
    linkedTransactionAccount: dto.paymentAccountNumber,
    currency: dto.currency,
    totalInterestEarned: dto.totalInterestEarned,
    closedDate: dto.closedDate,
  };
};

/**
 * Transform backend InterestRateDto to frontend SavingsTermType
 */
export const transformInterestRateToSavingsTerm = (rate: any): SavingsTermType => {
  // Handle null maxAmount by setting to a very high number (representing no limit)
  const maxAmount = rate.maxAmount !== null && rate.maxAmount !== undefined 
    ? rate.maxAmount 
    : Number.MAX_SAFE_INTEGER; // Use max safe integer to represent "no limit"

  return {
    interestRateId: rate.interestRateId,
    name: `Kỳ hạn ${rate.termMonths} tháng`,
    termMonths: rate.termMonths,
    annualRate: rate.annualRate,
    minAmount: rate.minAmount,
    maxAmount: maxAmount,
    status: rate.status,
    effectiveFrom: rate.effectiveFrom,
    effectiveTo: rate.effectiveTo,
    description: `Lãi suất ${rate.annualRate}%/năm cho kỳ hạn ${rate.termMonths} tháng`
  };
};

/**
 * Format currency for Vietnamese locale
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (text: string): number => {
  return parseInt(text.replace(/[^\d]/g, '')) || 0;
};

/**
 * Format date for Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

/**
 * Format date with time for Vietnamese locale
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate estimated interest for savings account
 */
export const calculateEstimatedInterest = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  const rate = annualRate / 100;
  const timeInYears = termMonths / 12;
  return principal * rate * timeInYears;
};

/**
 * Calculate days to maturity
 */
export const calculateDaysToMaturity = (maturityDate: string): number => {
  const maturity = new Date(maturityDate);
  const today = new Date();
  const diffTime = maturity.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
      return '#4CAF50';
    case 'PENDING':
      return '#FF9800';
    case 'MATURED':
      return '#FF9800';
    case 'REJECTED':
    case 'CLOSED':
      return '#F44336';
    case 'CANCELLED':
      return '#9E9E9E';
    default:
      return '#9E9E9E';
  }
};

/**
 * Get localized status text
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Đang hoạt động';
    case 'MATURED':
      return 'Đã đến hạn';
    case 'CLOSED':
      return 'Đã đóng';
    case 'PENDING':
      return 'Đang chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Bị từ chối';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

/**
 * Get request type text
 */
export const getRequestTypeText = (type: string): string => {
  return type === 'DEPOSIT' ? 'Nạp tiền mặt' : 'Rút tiền mặt';
};

/**
 * Get request type icon
 */
export const getRequestTypeIcon = (type: string): string => {
  return type === 'DEPOSIT' ? '💰' : '💸';
};

/**
 * Validate savings account creation form
 */
export const validateSavingsAccountForm = (
  selectedTerm: SavingsTermType | null,
  amount: number
): { isValid: boolean; error?: string } => {
  if (!selectedTerm) {
    return { isValid: false, error: 'Vui lòng chọn kỳ hạn gửi tiết kiệm' };
  }

  if (amount < selectedTerm.minAmount) {
    return { 
      isValid: false, 
      error: `Số tiền gửi tối thiểu là ${formatCurrency(selectedTerm.minAmount)}` 
    };
  }

  // Only validate maxAmount if it's not representing "no limit"
  if (selectedTerm.maxAmount !== Number.MAX_SAFE_INTEGER && amount > selectedTerm.maxAmount) {
    return { 
      isValid: false, 
      error: `Số tiền gửi tối đa là ${formatCurrency(selectedTerm.maxAmount)}` 
    };
  }

  return { isValid: true };
};

/**
 * Validate transfer amount
 */
export const validateTransferAmount = (
  amount: number,
  availableBalance?: number
): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: 'Vui lòng nhập số tiền hợp lệ' };
  }

  if (availableBalance !== undefined && amount > availableBalance) {
    return { isValid: false, error: 'Số dư không đủ' };
  }

  return { isValid: true };
};

/**
 * Validate savings request amount
 */
export const validateSavingsRequestAmount = (
  amount: number,
  type: 'DEPOSIT' | 'WITHDRAW',
  availableBalance?: number
): { isValid: boolean; error?: string } => {
  const MIN_AMOUNT = 100000; // 100,000 VND
  const MAX_AMOUNT = 500000000; // 500,000,000 VND

  if (amount <= 0) {
    return { isValid: false, error: 'Vui lòng nhập số tiền hợp lệ' };
  }

  if (amount < MIN_AMOUNT) {
    return { 
      isValid: false, 
      error: `Số tiền tối thiểu là ${formatCurrency(MIN_AMOUNT)}` 
    };
  }

  if (amount > MAX_AMOUNT) {
    return { 
      isValid: false, 
      error: `Số tiền tối đa là ${formatCurrency(MAX_AMOUNT)}` 
    };
  }

  if (type === 'WITHDRAW' && availableBalance !== undefined && amount > availableBalance) {
    return { isValid: false, error: 'Số dư tài khoản tiết kiệm không đủ' };
  }

  return { isValid: true };
};