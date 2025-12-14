import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { formatCurrencyByLanguage } from '../../../utils/currency';

interface CardBalanceSectionProps {
  balance?: number;
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

  const getAccountTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SAVINGS: t('card.account_type_savings'),
      CHECKING: t('card.account_type_checking'),
      CREDIT: t('card.account_type_credit'),
      DEBIT: t('card.account_type_debit'),
    };
    return typeMap[type.toUpperCase()] || t('card.account_type_default');
  };

  // Nếu không có accountNumber, hiển thị thông báo khuyến khích mở thẻ
  if (!accountNumber) {
    return (
      <View style={styles.container}>
        <View style={styles.noAccountContainer}>
          <View style={styles.iconContainer}>
            <Icon name="card-outline" size={32} color={Colors.main_bule} />
          </View>
          <Text style={styles.noAccountTitle}>
            {t('card.no_account_title')}
          </Text>
          <Text style={styles.noAccountMessage}>
            {t('card.no_account_message')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('card.balance_available')}</Text>
      <Text style={styles.balance}>
        {formatCurrencyByLanguage(balance || 0)}
      </Text>
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
  noAccountContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.main_bule}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.grey3,
    letterSpacing: 1,
    marginBottom: 8,
  },
  noAccountMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default CardBalanceSection;
