import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import { isIncomingTransaction } from '../../../utils/transactionUtils';
import Colors from '../../../constants/color';

interface TransactionItemProps {
  transaction: TransferResponse;
  currentAccountNumber: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  currentAccountNumber,
}) => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);
  const date = new Date(transaction.transactionAt);
  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const iconName = isIncoming ? 'arrow-down-circle' : 'arrow-up-circle';
  const iconBg = isIncoming ? '#E8F5E9' : '#FFEBEE';
  const iconColor = isIncoming ? '#4CAF50' : '#F44336';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionRow}>
        {/* Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={2}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionTime}>
            {time} - {dateStr}
          </Text>

          {/* Action Links - chỉ "Chuyển thêm" cho TRANSFER */}
          {transaction.transactionType === 'TRANSFER' && (
            <View style={styles.actionLinks}>
              <TouchableOpacity>
                <Text style={styles.actionLink}>Chuyển thêm ›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Amount and Balance */}
        <View style={styles.amountWrapper}>
          <Text
            style={[styles.amount, { color: isIncoming ? '#4CAF50' : '#333' }]}
          >
            {isIncoming ? '+' : '-'}
            {transaction.amount.toLocaleString('vi-VN')}
            {transaction.currency}
          </Text>
          {transaction.balance !== undefined && (
            <Text style={styles.balance}>
              Số dư ví: {transaction.balance.toLocaleString('vi-VN')}
              {transaction.currency}
            </Text>
          )}
        </View>
      </View>

      {/* Separator line */}
      <View style={styles.separator} />
    </View>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  transactionItem: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 52,
    marginTop: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  transactionTime: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  actionLinks: {
    flexDirection: 'row',
  },
  actionLink: {
    fontSize: 13,
    color: Colors.main_bule,
    fontWeight: '500',
  },
  amountWrapper: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  balance: {
    fontSize: 12,
    color: '#999',
  },
});
