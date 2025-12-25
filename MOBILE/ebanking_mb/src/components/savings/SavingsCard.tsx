import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SavingsAccount } from '../../types/SavingsTypes';
import Colors from '../../constants/color';

interface SavingsCardProps {
  account: SavingsAccount;
  onPress: () => void;
}

export default function SavingsCard({ account, onPress }: SavingsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: '#10B981',
          bgColor: '#ECFDF5',
          text: 'Đang hoạt động',
          icon: 'checkmark-circle' as const,
        };
      case 'MATURED':
        return {
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          text: 'Đã đến hạn',
          icon: 'time' as const,
        };
      case 'CLOSED':
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          text: 'Đã đóng',
          icon: 'close-circle' as const,
        };
      default:
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          text: status,
          icon: 'ellipse' as const,
        };
    }
  };

  const isClosedAccount = account.status === 'CLOSED';
  const statusConfig = getStatusConfig(account.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${Colors.main_bule}15` },
              ]}
            >
              <Ionicons name="wallet" size={20} color={Colors.main_bule} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.accountName} numberOfLines={1}>
                {account.accountName || `Tiết kiệm ${account.termMonths} tháng`}
              </Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={12}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          {isClosedAccount ? (
            <>
              <Text style={styles.balanceLabel}>Thời gian tất toán</Text>
              <Text style={styles.closureTime}>
                {account.updatedAt
                  ? formatDateTime(account.updatedAt)
                  : 'Không xác định'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
              <Text style={styles.balance}>
                {formatCurrency(account.balance)}{' '}
                <Text style={styles.currency}>₫</Text>
              </Text>
            </>
          )}
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={styles.detailIconWrapper}>
              <Ionicons name="trending-up" size={14} color={Colors.main_bule} />
            </View>
            <Text style={styles.detailLabel}>Lãi suất</Text>
            <Text style={styles.detailValue}>
              {(account.interestRate * 100).toFixed(2)}%/năm
            </Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIconWrapper}>
              <Ionicons name="calendar" size={14} color={Colors.main_bule} />
            </View>
            <Text style={styles.detailLabel}>Kỳ hạn</Text>
            <Text style={styles.detailValue}>{account.termMonths} tháng</Text>
          </View>

          {account.totalInterestEarned !== undefined && (
            <View style={styles.detailCard}>
              <View style={styles.detailIconWrapper}>
                <Ionicons name="cash" size={14} color={Colors.main_bule} />
              </View>
              <Text style={styles.detailLabel}>Lãi đã nhận</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(account.totalInterestEarned)} ₫
              </Text>
            </View>
          )}
        </View>

        {/* Date Info */}
        <View style={styles.dateSection}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.grey3} />
            <Text style={styles.dateText}>
              Ngày mở: {formatDate(account.openDate)}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.grey3} />
            <Text style={styles.dateText}>
              Đến hạn: {formatDate(account.maturityDate)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  cardContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  closureTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    margin: 4,
  },
  detailIconWrapper: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateSection: {
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
