import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';

interface CardBalanceSectionProps {
  balance: number;
  currency?: string;
  accountNumber?: string | null;
  accountType?: string; // From API: SAVINGS, CHECKING, etc.
}

const CardBalanceSection: React.FC<CardBalanceSectionProps> = ({
  balance,
  currency = 'VNĐ',
  accountNumber,
  accountType = 'SAVINGS',
}) => {
  const { t } = useTranslation();

  const formatBalance = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const getAccountTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SAVINGS: 'Tài khoản tiết kiệm',
      CHECKING: 'Tài khoản thanh toán',
      CREDIT: 'Thẻ tín dụng',
      DEBIT: 'Thẻ ghi nợ',
    };
    return typeMap[type.toUpperCase()] || 'Tài khoản';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SỐ DƯ KHẢ DỤNG</Text>
      <Text style={styles.balance}>{formatBalance(balance)} ₫</Text>
      <Text style={styles.cardTypeText}>
        {getAccountTypeLabel(accountType)}
      </Text>
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
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey3,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.main_bule,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardTypeText: {
    fontSize: 13,
    color: Colors.grey3,
    fontWeight: '500',
  },
});

export default CardBalanceSection;
