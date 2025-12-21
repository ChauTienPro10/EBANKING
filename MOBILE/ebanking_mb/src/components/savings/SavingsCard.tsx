import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SavingsAccount } from '../../types/SavingsTypes';

interface SavingsCardProps {
  account: SavingsAccount;
  onPress: () => void;
}

export default function SavingsCard({ account, onPress }: SavingsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'MATURED':
        return '#FF9800';
      case 'CLOSED':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'MATURED':
        return 'Đã đến hạn';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.accountName}>
            {account.accountName || `Tài khoản tiết kiệm ${account.termMonths} tháng`}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(account.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(account.status)}</Text>
          </View>
        </View>

        <Text style={styles.accountNumber}>
          STK: {account.accountNumber}
        </Text>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lãi suất</Text>
            <Text style={styles.detailValue}>{account.interestRate}%/năm</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Kỳ hạn</Text>
            <Text style={styles.detailValue}>{account.termMonths} tháng</Text>
          </View>
          {account.totalInterestEarned !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lãi đã nhận</Text>
              <Text style={styles.detailValue}>{formatCurrency(account.totalInterestEarned)}</Text>
            </View>
          )}
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Ngày mở: {formatDate(account.openDate)}
          </Text>
          <Text style={styles.dateText}>
            Ngày đến hạn: {formatDate(account.maturityDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    backgroundColor: '#1976D2',
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 16,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#E3F2FD',
    marginBottom: 2,
  },
});