import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { formatCurrencyByLanguage, convertVNDtoUSD } from '../../../utils/currency';
import { AnalysisTransaction } from '../../../store/AnalysisModel';

export interface TopInsightsProps {
  largestTransaction: AnalysisTransaction | null;
  mostFrequentRecipient: {
    accountNumber: string;
    count: number;
    totalAmount: number;
  } | null;
  averageTransaction: number;
  currentAccountNumber: string;
  largestLabel: string;
  frequentLabel: string;
  averageLabel: string;
  transactionsLabel: string;
  totalLabel: string;
  noDataLabel: string;
  currency?: 'VND' | 'USD';
}

const TopInsights: React.FC<TopInsightsProps> = ({
  largestTransaction,
  mostFrequentRecipient,
  averageTransaction,
  currentAccountNumber,
  largestLabel,
  frequentLabel,
  averageLabel,
  transactionsLabel,
  totalLabel,
  noDataLabel,
  currency,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Show full account number
    return accountNumber;
  };

  // Helper to format values based on currency prop logic
  const formatValue = (val: number) => {
    if (currency === 'USD') {
      const usd = convertVNDtoUSD(val);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(usd);
    } else if (currency === 'VND') {
      return `${val.toLocaleString('vi-VN')} đ`;
    }
    return formatCurrencyByLanguage(val);
  };

  return (
    <View style={styles.container}>
      {/* Largest Transaction */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.orange + '20' },
            ]}
          >
            <Ionicons name="trending-up" size={20} color={Colors.orange} />
          </View>
          <Text style={styles.cardTitle}>{largestLabel}</Text>
        </View>
        {largestTransaction ? (
          <View style={styles.cardContent}>
            <Text style={styles.amount}>
              {formatValue(
                parseFloat(largestTransaction.amount.toString()),
              )}
            </Text>
            <Text style={styles.detail}>
              {largestTransaction.receiverAccountNumber === currentAccountNumber
                ? `← ${formatAccountNumber(
                  largestTransaction.senderAccountNumber,
                )}`
                : `→ ${formatAccountNumber(
                  largestTransaction.receiverAccountNumber,
                )}`}
            </Text>
            <Text style={styles.date}>
              {formatDate(largestTransaction.transactionAt)}
            </Text>
          </View>
        ) : (
          <Text style={styles.noData}>{noDataLabel}</Text>
        )}
      </View>

      {/* Most Frequent Recipient */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.purple + '20' },
            ]}
          >
            <Ionicons name="repeat" size={20} color={Colors.purple} />
          </View>
          <Text style={styles.cardTitle}>{frequentLabel}</Text>
        </View>
        {mostFrequentRecipient ? (
          <View style={styles.cardContent}>
            <Text style={styles.accountNumber}>
              {formatAccountNumber(mostFrequentRecipient.accountNumber)}
            </Text>
            <Text style={styles.detail}>
              {mostFrequentRecipient.count} {transactionsLabel} • {totalLabel}:{' '}
              {formatValue(mostFrequentRecipient.totalAmount)}
            </Text>
          </View>
        ) : (
          <Text style={styles.noData}>{noDataLabel}</Text>
        )}
      </View>

      {/* Average Transaction */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.main_bule + '20' },
            ]}
          >
            <Ionicons name="stats-chart" size={20} color={Colors.main_bule} />
          </View>
          <Text style={styles.cardTitle}>{averageLabel}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.amount}>
            {formatValue(Math.round(averageTransaction))}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  cardContent: {
    gap: 6,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  noData: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default TopInsights;
