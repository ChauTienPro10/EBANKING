import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

interface TransferInfoSectionProps {
  transaction: TransferResponse;
  isIncoming: boolean;
  displayTitle: string;
  bankName: string | null;
}

const TransferInfoSection: React.FC<TransferInfoSectionProps> = ({
  transaction,
  isIncoming,
  displayTitle,
  bankName,
}) => {
  if (transaction.transactionType !== 'TRANSFER') {
    return null;
  }

  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoSectionTitle}>Thông tin chuyển khoản</Text>

      {/* Receiver/Sender Account */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {isIncoming ? 'Từ tài khoản' : 'Đến tài khoản'}
        </Text>
        <Text style={styles.infoValue}>
          {isIncoming
            ? transaction.senderAccountNumber
            : transaction.receiverAccountNumber}
        </Text>
      </View>

      {/* Bank Name */}
      {bankName && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngân hàng</Text>
          <Text style={styles.infoValue}>{bankName}</Text>
        </View>
      )}

      {/* Receiver/Sender Name */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {isIncoming ? 'Người gửi' : 'Người nhận'}
        </Text>
        <Text style={styles.infoValue}>{displayTitle}</Text>
      </View>

      {/* Amount */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Số tiền</Text>
        <Text style={styles.infoValue}>
          {transaction.amount.toLocaleString('vi-VN')}
          {transaction.currency}
        </Text>
      </View>

      {/* Message/Description */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Nội dung</Text>
        <Text style={styles.infoValue}>{transaction.description}</Text>
      </View>
    </View>
  );
};

export default TransferInfoSection;

const styles = StyleSheet.create({
  infoSection: {
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
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});
