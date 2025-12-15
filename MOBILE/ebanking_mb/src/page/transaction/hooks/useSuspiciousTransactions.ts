import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
  analyzeSuspiciousTransactions,
  getSuspiciousCount,
} from '../../../utils/suspiciousTransactionDetector';
import { SuspiciousAnalysis } from '../types/suspiciousTypes';

/**
 * Custom hook to manage suspicious transactions detection and analysis
 */
export const useSuspiciousTransactions = () => {
  // Get transactions from Redux store
  const transactions = useSelector(
    (state: RootState) => state.transactionHistories.data,
  );
  const loading = useSelector(
    (state: RootState) => state.transactionHistories.loading,
  );
  const currentAccountNumber = useSelector(
    (state: RootState) => state.app.accountTransResponse?.accountNumber,
  );

  // Analyze suspicious transactions
  const analysis: SuspiciousAnalysis = useMemo(() => {
    if (!currentAccountNumber || transactions.length === 0) {
      return {
        highRisk: [],
        mediumRisk: [],
        lowRisk: [],
        totalCount: 0,
        lastAnalyzedAt: new Date().toISOString(),
      };
    }

    return analyzeSuspiciousTransactions(transactions, currentAccountNumber);
  }, [transactions, currentAccountNumber]);

  // Get suspicious count for badge
  const suspiciousCount = useMemo(() => {
    if (!currentAccountNumber) return 0;
    return getSuspiciousCount(transactions, currentAccountNumber);
  }, [transactions, currentAccountNumber]);

  // Get all suspicious transactions in a flat array
  const allSuspicious = useMemo(() => {
    return [...analysis.highRisk, ...analysis.mediumRisk, ...analysis.lowRisk];
  }, [analysis]);

  return {
    analysis,
    suspiciousCount,
    allSuspicious,
    loading,
    hasData: allSuspicious.length > 0,
  };
};
