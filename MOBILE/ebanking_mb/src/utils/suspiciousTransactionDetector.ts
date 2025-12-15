import { TransferResponse } from '../store/fetchAPI/TransactionHistory';
import {
  SuspiciousTransaction,
  SuspiciousAnalysis,
  SuspiciousReason,
  RiskLevel,
  DetectionThresholds,
  DEFAULT_THRESHOLDS,
} from '../page/transaction/types/suspiciousTypes';

/**
 * Check if a transaction occurred during late night hours (23:00 - 05:00)
 */
export const isLateNightTransaction = (
  transaction: TransferResponse,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): boolean => {
  const date = new Date(transaction.transactionAt);
  const hour = date.getHours();

  // Handle overnight range (e.g., 23:00 to 05:00)
  if (thresholds.lateNightStart > thresholds.lateNightEnd) {
    return hour >= thresholds.lateNightStart || hour < thresholds.lateNightEnd;
  }

  return hour >= thresholds.lateNightStart && hour < thresholds.lateNightEnd;
};

/**
 * Get formatted time string for late night transaction
 */
export const getLateNightTime = (transaction: TransferResponse): string => {
  const date = new Date(transaction.transactionAt);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Check if a transaction amount is considered large
 */
export const isLargeAmount = (
  transaction: TransferResponse,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): boolean => {
  return transaction.amount > thresholds.largeAmountThreshold;
};

/**
 * Find transactions with repeated recipients/senders within a time window
 * BIDIRECTIONAL: Counts both outgoing and incoming transactions with the same account
 * Returns a map of account numbers to their transaction counts
 */
export const findRepeatedRecipients = (
  transactions: TransferResponse[],
  currentAccountNumber: string,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): Map<string, TransferResponse[]> => {
  const accountMap = new Map<string, TransferResponse[]>();

  // Sort transactions by time (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime(),
  );

  sortedTransactions.forEach(transaction => {
    // Get the OTHER account (not current user's account)
    const otherAccount =
      transaction.senderAccountNumber === currentAccountNumber
        ? transaction.receiverAccountNumber // Outgoing: get recipient
        : transaction.receiverAccountNumber === currentAccountNumber
        ? transaction.senderAccountNumber // Incoming: get sender
        : null;

    // Skip if this transaction doesn't involve current user
    if (!otherAccount) {
      return;
    }

    const transactionTime = new Date(transaction.transactionAt).getTime();

    // Get or create account transaction list
    if (!accountMap.has(otherAccount)) {
      accountMap.set(otherAccount, []);
    }

    const accountTransactions = accountMap.get(otherAccount)!;

    // Check if this transaction is within the time window of any existing transaction
    const withinWindow = accountTransactions.some(existingTx => {
      const existingTime = new Date(existingTx.transactionAt).getTime();
      const timeDiff = Math.abs(transactionTime - existingTime);
      return timeDiff <= thresholds.repeatedTransactionWindow;
    });

    if (withinWindow || accountTransactions.length === 0) {
      accountTransactions.push(transaction);
    }
  });

  // Filter to only include accounts with suspicious repeat count
  const suspiciousAccounts = new Map<string, TransferResponse[]>();
  accountMap.forEach((txs, account) => {
    if (txs.length >= thresholds.repeatedTransactionCount) {
      suspiciousAccounts.set(account, txs);
    }
  });

  return suspiciousAccounts;
};

/**
 * Calculate risk level based on number of suspicious reasons
 */
export const calculateRiskLevel = (
  suspiciousReasons: SuspiciousReason[],
): RiskLevel => {
  const reasonCount = suspiciousReasons.length;

  if (reasonCount >= 2) {
    return 'HIGH';
  } else if (reasonCount === 1) {
    return 'MEDIUM';
  }

  return 'LOW';
};

/**
 * Analyze a single transaction for suspicious activity
 */
export const analyzeTransaction = (
  transaction: TransferResponse,
  allTransactions: TransferResponse[],
  currentAccountNumber: string,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): SuspiciousTransaction | null => {
  const suspiciousReasons: SuspiciousReason[] = [];
  const reasonDetails: SuspiciousTransaction['reasonDetails'] = {};

  // Check for late night transaction
  if (isLateNightTransaction(transaction, thresholds)) {
    suspiciousReasons.push('LATE_NIGHT');
    reasonDetails.lateNightTime = getLateNightTime(transaction);
  }

  // Check for large amount
  if (isLargeAmount(transaction, thresholds)) {
    suspiciousReasons.push('LARGE_AMOUNT');
    reasonDetails.amount = transaction.amount;
  }

  // Check for repeated recipient/sender (bidirectional)
  const repeatedAccounts = findRepeatedRecipients(
    allTransactions,
    currentAccountNumber,
    thresholds,
  );

  // Get the OTHER account (not current user)
  const otherAccount =
    transaction.senderAccountNumber === currentAccountNumber
      ? transaction.receiverAccountNumber // Outgoing: recipient
      : transaction.senderAccountNumber; // Incoming: sender

  if (repeatedAccounts.has(otherAccount)) {
    const repeatCount = repeatedAccounts.get(otherAccount)!.length;
    suspiciousReasons.push('REPEATED_RECIPIENT');
    reasonDetails.repeatCount = repeatCount;
  }

  // If no suspicious reasons found, return null
  if (suspiciousReasons.length === 0) {
    return null;
  }

  // Calculate risk level
  const riskLevel = calculateRiskLevel(suspiciousReasons);

  return {
    ...transaction,
    riskLevel,
    suspiciousReasons,
    reasonDetails,
  };
};

/**
 * Analyze all transactions and group by risk level
 */
export const analyzeSuspiciousTransactions = (
  transactions: TransferResponse[],
  currentAccountNumber: string,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): SuspiciousAnalysis => {
  const suspiciousTransactions: SuspiciousTransaction[] = [];

  // Analyze each transaction
  transactions.forEach(transaction => {
    const analysis = analyzeTransaction(
      transaction,
      transactions,
      currentAccountNumber,
      thresholds,
    );

    if (analysis) {
      suspiciousTransactions.push(analysis);
    }
  });

  // Group by risk level
  const highRisk = suspiciousTransactions.filter(tx => tx.riskLevel === 'HIGH');
  const mediumRisk = suspiciousTransactions.filter(
    tx => tx.riskLevel === 'MEDIUM',
  );
  const lowRisk = suspiciousTransactions.filter(tx => tx.riskLevel === 'LOW');

  return {
    highRisk,
    mediumRisk,
    lowRisk,
    totalCount: suspiciousTransactions.length,
    lastAnalyzedAt: new Date().toISOString(),
  };
};

/**
 * Get suspicious transaction count for badge display
 */
export const getSuspiciousCount = (
  transactions: TransferResponse[],
  currentAccountNumber: string,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): number => {
  const analysis = analyzeSuspiciousTransactions(
    transactions,
    currentAccountNumber,
    thresholds,
  );
  return analysis.totalCount;
};
