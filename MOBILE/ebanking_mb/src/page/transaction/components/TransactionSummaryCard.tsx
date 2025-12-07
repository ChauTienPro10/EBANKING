import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import Colors from '../../../constants/color';

interface TransactionSummaryCardProps {
  transaction: TransferResponse;
  displayTitle: string;
  bankName: string | null;
  iconConfig: {
    name: string;
    bg: string;
    color: string;
  };
  isIncoming: boolean;
  currentAccountNumber: string;
  statusBadge: {
    text: string;
    bg: string;
    color: string;
  };
  timeStr: string;
  dateStr: string;
  onCopyTransactionId: () => void;
}

const TransactionSummaryCard: React.FC<TransactionSummaryCardProps> = ({
  transaction,
  displayTitle,
  bankName,
  iconConfig,
  isIncoming,
  currentAccountNumber,
  statusBadge,
  timeStr,
  dateStr,
  onCopyTransactionId,
}) => {
  return (
    <View style={styles.summaryCard}>
      {/* Icon and Title */}
      <View style={styles.summaryHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}
        >
          <MaterialCommunityIcons
            name={iconConfig.name}
            size={32}
            color={iconConfig.color}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.merchantName}>{displayTitle}</Text>
          {bankName && <Text style={styles.bankName}>({bankName})</Text>}
          {/* Amount */}
          <Text style={styles.amount}>
            {isIncoming ? '' : '-'}
            {transaction.amount.toLocaleString('vi-VN')}
            {transaction.currency}
          </Text>
        </View>
      </View>

      {/* Status and Time Row */}
      <View style={styles.statusTimeRow}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Trạng thái</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}
          >
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Time */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Thời gian</Text>
        <Text style={styles.detailValue}>
          {timeStr} - {dateStr}
        </Text>
      </View>

      {/* Transaction ID */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Mã giao dịch</Text>
        <Text style={styles.detailValue}>{transaction.transactionId}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={onCopyTransactionId}
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={18}
            color={Colors.main_bule}
          />
        </TouchableOpacity>
      </View>

      {/* Account/Card */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tài khoản/thẻ</Text>
        <Text style={styles.detailValue}>
          {transaction.transactionType === 'PAYMENT'
            ? 'Ví MoMo'
            : isIncoming
            ? currentAccountNumber
            : transaction.senderAccountNumber}
        </Text>
      </View>

      {/* Fee */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tổng phí</Text>
        <Text style={styles.detailValue}>Miễn phí</Text>
      </View>

      {/* Balance if available */}
      {transaction.balance !== undefined && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số dư ví</Text>
          <Text style={styles.detailValue}>
            {transaction.balance.toLocaleString('vi-VN')}
            {transaction.currency}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TransactionSummaryCard;

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
  },
  bankName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statusTimeRow: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
});
