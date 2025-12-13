// Filter Types and Interfaces

export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface TimePeriodFilter {
  label: string;
  startDate: string | null;
  endDate: string | null;
}

export interface AmountRangeFilter {
  label: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface StatusFilter {
  label: string;
  value: TransactionStatus | null;
}

export interface FilterState {
  timePeriod: TimePeriodFilter;
  amountRange: AmountRangeFilter;
  status: StatusFilter;
}

// Time Period Options
export interface TimePeriodOption {
  label: string;
  month: number; // 1-12
  year: number;
}

export const generateTimePeriodOptions = (): TimePeriodOption[] => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const options: TimePeriodOption[] = [];

  // Generate last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentDate.getMonth() - i, 1);
    options.push({
      label: `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return options;
};

export const getDateRangeForMonth = (
  month: number,
  year: number,
): { startDate: string; endDate: string } => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

// Amount Range Options
export interface AmountRangeOption {
  label: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export const AMOUNT_RANGE_OPTIONS: AmountRangeOption[] = [
  { label: 'Tất cả', minAmount: null, maxAmount: null },
  { label: 'Dưới 100k', minAmount: null, maxAmount: 100000 },
  { label: '100k - 1M', minAmount: 100000, maxAmount: 1000000 },
  { label: 'Trên 1M', minAmount: 1000000, maxAmount: null },
];

// Status Options
export interface StatusOption {
  label: string;
  value: TransactionStatus | null;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Tất cả', value: null },
  { label: 'Thành công', value: 'SUCCESS' },
  { label: 'Thất bại', value: 'FAILED' },
];

// Default Filter State
export const DEFAULT_FILTER_STATE: FilterState = {
  timePeriod: {
    label: 'Tất cả',
    startDate: null,
    endDate: null,
  },
  amountRange: {
    label: 'Tất cả',
    minAmount: null,
    maxAmount: null,
  },
  status: {
    label: 'Tất cả',
    value: null,
  },
};

// Helper function to check if transaction matches filters
export const matchesFilters = (
  transaction: any,
  filters: FilterState,
): boolean => {
  // Time period filter
  if (filters.timePeriod.startDate && filters.timePeriod.endDate) {
    const transactionDate = new Date(transaction.transactionAt);
    const startDate = new Date(filters.timePeriod.startDate);
    const endDate = new Date(filters.timePeriod.endDate);

    if (transactionDate < startDate || transactionDate > endDate) {
      return false;
    }
  }

  // Amount range filter
  if (filters.amountRange.minAmount !== null) {
    if (transaction.amount < filters.amountRange.minAmount) {
      return false;
    }
  }
  if (filters.amountRange.maxAmount !== null) {
    if (transaction.amount > filters.amountRange.maxAmount) {
      return false;
    }
  }

  // Status filter
  if (filters.status.value !== null) {
    if (transaction.status !== filters.status.value) {
      return false;
    }
  }

  return true;
};
