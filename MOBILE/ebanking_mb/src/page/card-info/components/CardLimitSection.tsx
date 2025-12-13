import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../constants/color';
import SettingsIcon from '../../../components/icon/SettingsIcon';

interface CardLimitSectionProps {
  dailyLimit: number;
  singleLimit: number;
  usedAmount: number;
  onManagePress?: () => void;
}

export const CardLimitSection: React.FC<CardLimitSectionProps> = ({
  dailyLimit,
  singleLimit,
  usedAmount,
  onManagePress,
}) => {
  const navigation = useNavigation();
  const dailyPercentage = Math.min((usedAmount / dailyLimit) * 100, 100);
  const remainingDaily = Math.max(dailyLimit - usedAmount, 0);

  const formatMoney = (amount: number): string => {
    return amount.toLocaleString('vi-VN');
  };

  const formatShort = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}tỷ`;
    }
    if (amount >= 1000000) {
      return `${Math.round(amount / 1000000)}tr`;
    }
    return `${Math.round(amount / 1000)}k`;
  };

  const handleManagePress = () => {
    if (onManagePress) {
      onManagePress();
    } else {
      navigation.navigate('ManageLimits' as never);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HẠN MỨC GIAO DỊCH</Text>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManagePress}
        >
          <SettingsIcon size={16} color={Colors.main_bule} />
          <Text style={styles.manageButtonText}>Quản lý</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Limit Progress */}
      <View style={styles.limitCard}>
        <View style={styles.limitHeader}>
          <Text style={styles.limitLabel}>Hạn mức ngày</Text>
          <View style={styles.percentageBadge}>
            <Text style={styles.percentageText}>
              {dailyPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${dailyPercentage}%` }]}
          />
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.usedText}>
            Đã dùng:{' '}
            <Text style={styles.usedAmount}>{formatShort(usedAmount)}</Text>
          </Text>
          <Text style={styles.limitText}>{formatShort(dailyLimit)}</Text>
        </View>

        <Text style={styles.remainingText}>
          Còn lại: {formatMoney(remainingDaily)} ₫
        </Text>
      </View>

      {/* Single Transaction Limit */}
      <View style={styles.singleLimitCard}>
        <Text style={styles.limitLabel}>Hạn mức giao dịch đơn</Text>
        <Text style={styles.singleLimitAmount}>
          {formatMoney(singleLimit)} ₫
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey3,
    letterSpacing: 0.5,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.main_bule + '10',
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  limitCard: {
    marginBottom: 16,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  percentageBadge: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0F2F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.main_bule,
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  usedText: {
    fontSize: 12,
    color: Colors.grey3,
  },
  usedAmount: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey3,
  },
  remainingText: {
    fontSize: 11,
    color: Colors.main_bule,
    fontWeight: '500',
  },
  singleLimitCard: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  singleLimitAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
});