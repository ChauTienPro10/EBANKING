import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/color';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

interface TransactionDetailsSectionProps {
  transaction: TransferResponse;
  currentAccountNumber: string;
  isIncoming: boolean;
  onCopyTransactionId: () => void;
}

const TransactionDetailsSection: React.FC<TransactionDetailsSectionProps> = ({
  transaction,
  currentAccountNumber,
  isIncoming,
  onCopyTransactionId,
}) => {
  return (
    <View style={styles.detailsSection}>
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

export default TransactionDetailsSection;

const styles = StyleSheet.create({
  detailsSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
