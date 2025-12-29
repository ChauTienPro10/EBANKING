// Statistics utility functions
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

export type TimePeriod = 'week' | 'month' | 'year';

export interface PeriodStats {
  totalTransactions: number;
  totalIncoming: number;
  totalOutgoing: number;
  largestTransaction: TransferResponse | null;
  mostFrequentRecipient: {
    accountNumber: string;
    count: number;
    totalAmount: number;
  } | null;
  averageTransaction: number;
}

/**
 * Get date range for a specific period
 */
export const getDateRange = (
  period: TimePeriod,
  offset: number = 0,
): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'week':
      // Current week starts from Monday
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
      start.setDate(now.getDate() - diff - offset * 7);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case 'month':
      start.setMonth(now.getMonth() - offset);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0); // Last day of month
      end.setHours(23, 59, 59, 999);
      break;

    case 'year':
      start.setFullYear(now.getFullYear() - offset);
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(start.getFullYear());
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByPeriod = (
  transactions: TransferResponse[],
  period: TimePeriod,
  offset: number = 0,
): TransferResponse[] => {
  const { start, end } = getDateRange(period, offset);

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionAt);
    return transactionDate >= start && transactionDate <= end;
  });
};

/**
 * Calculate statistics for a period
 */
export const calculatePeriodStats = (
  transactions: TransferResponse[],
  currentAccountNumber: string,
): PeriodStats => {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalIncoming: 0,
      totalOutgoing: 0,
      largestTransaction: null,
      mostFrequentRecipient: null,
      averageTransaction: 0,
    };
  }

  let totalIncoming = 0;
  let totalOutgoing = 0;
  let largestTransaction: TransferResponse | null = null;
  let largestAmount = 0;

  // Track recipients for outgoing transactions
  const recipientMap = new Map<
    string,
    { count: number; totalAmount: number }
  >();

  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount.toString());
    const isIncoming =
      transaction.receiverAccountNumber === currentAccountNumber;

    if (isIncoming) {
      totalIncoming += amount;
    } else {
      totalOutgoing += amount;

      // Track recipient
      const recipient = transaction.receiverAccountNumber;
      const existing = recipientMap.get(recipient) || {
        count: 0,
        totalAmount: 0,
      };
      recipientMap.set(recipient, {
        count: existing.count + 1,
        totalAmount: existing.totalAmount + amount,
      });
    }

    // Track largest transaction
    if (amount > largestAmount) {
      largestAmount = amount;
      largestTransaction = transaction;
    }
  });

  // Find most frequent recipient
  let mostFrequentRecipient: PeriodStats['mostFrequentRecipient'] = null;
  let maxCount = 0;

  recipientMap.forEach((data, accountNumber) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      mostFrequentRecipient = {
        accountNumber,
        count: data.count,
        totalAmount: data.totalAmount,
      };
    }
  });

  const averageTransaction =
    (totalIncoming + totalOutgoing) / transactions.length;

  return {
    totalTransactions: transactions.length,
    totalIncoming,
    totalOutgoing,
    largestTransaction,
    mostFrequentRecipient,
    averageTransaction,
  };
};

/**
 * Calculate percentage change between two periods
 */
export const calculatePercentageChange = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get currency suffix based on amount
 */
export const getCurrencySuffix = (amount: number): string => {
  if (amount >= 1000000) {
    return 'M';
  } else if (amount >= 1000) {
    return 'K';
  }
  return '';
};

/**
 * Get period label with i18n support
 */
export const getPeriodLabel = (
  period: TimePeriod,
  offset: number = 0,
  t?: (key: string, params?: any) => string,
): string => {
  const { start, end } = getDateRange(period, offset);

  switch (period) {
    case 'week':
      return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
        end.getMonth() + 1
      }`;
    case 'month':
      if (t) {
        return t('statistics.month_label', {
          month: start.getMonth() + 1,
          year: start.getFullYear(),
        });
      }
      return `${start.getMonth() + 1}/${start.getFullYear()}`;
    case 'year':
      if (t) {
        return t('statistics.year_label', { year: start.getFullYear() });
      }
      return `${start.getFullYear()}`;
  }
};

/**
 * Calculate trend data for line chart
 * Week: daily breakdown (7 days)
 * Month: weekly breakdown (4-5 weeks)
 * Year: monthly breakdown (12 months)
 */
export const calculateTrendData = (
  transactions: TransferResponse[],
  period: TimePeriod,
  currentAccountNumber: string,
): { labels: string[]; data: number[] } => {
  // Use current date range for the period, not from transactions
  // This ensures we show the full period even if there are no transactions in some days/weeks
  const { start, end } = getDateRange(period, 0);

  if (period === 'week') {
    // Daily breakdown for week
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      // Label: T2, T3, T4, T5, T6, T7, CN
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      labels.push(dayNames[day.getDay()]);

      // Calculate total for this day
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.transactionAt);
        return tDate >= dayStart && tDate <= dayEnd;
      });

      const total = dayTransactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount.toString());
        // Only count outgoing transactions
        if (t.senderAccountNumber === currentAccountNumber) {
          return sum + amount;
        }
        return sum;
      }, 0);

      data.push(total);
    }

    return { labels, data };
  } else if (period === 'month') {
    // Weekly breakdown for month - 4 weeks
    const labels: string[] = [];
    const data: number[] = [];

    const daysInMonth = end.getDate();

    // Divide month into 4 equal weeks
    const daysPerWeek = Math.ceil(daysInMonth / 4);

    for (let i = 0; i < 4; i++) {
      const weekStartDay = i * daysPerWeek + 1;
      const weekEndDay = Math.min((i + 1) * daysPerWeek, daysInMonth);

      const weekStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        weekStartDay,
        0,
        0,
        0,
        0,
      );
      const weekEnd = new Date(
        start.getFullYear(),
        start.getMonth(),
        weekEndDay,
        23,
        59,
        59,
        999,
      );

      // Label format: "1-8/12", "9-15/12", etc.
      labels.push(`${weekStartDay}-${weekEndDay}/${start.getMonth() + 1}`);

      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.transactionAt);
        return tDate >= weekStart && tDate <= weekEnd;
      });

      const total = weekTransactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount.toString());
        // Only count outgoing transactions
        if (t.senderAccountNumber === currentAccountNumber) {
          return sum + amount;
        }
        return sum;
      }, 0);

      data.push(total);
    }

    return { labels, data };
  } else {
    // Monthly breakdown for year
    const labels: string[] = [];
    const data: number[] = [];

    const year = start.getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59, 999);

      // Label: T1, T2, ..., T12
      labels.push(`T${i + 1}`);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transactionAt);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const total = monthTransactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount.toString());
        // Only count outgoing transactions
        if (t.senderAccountNumber === currentAccountNumber) {
          return sum + amount;
        }
        return sum;
      }, 0);

      data.push(total);
    }

    return { labels, data };
  }
};
