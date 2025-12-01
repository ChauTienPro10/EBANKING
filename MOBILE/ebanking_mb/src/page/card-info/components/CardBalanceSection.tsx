import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import { formatCurrency } from '../mockCardData';

interface CardBalanceSectionProps {
  balance: number;
  currency?: string;
  accountNumber?: string | null;
}

const CardBalanceSection: React.FC<CardBalanceSectionProps> = ({
  balance,
  currency = 'VNĐ',
  accountNumber,
}) => {
  const { t } = useTranslation();

  const formattedAccountNumber = accountNumber
    ? accountNumber.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim()
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('card.balance_title')}</Text>
      <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
      <Text style={styles.subtitle}>{t('card.balance_subtitle')}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('card.balance_currency')}</Text>
          <Text style={styles.metaValue}>{currency}</Text>
        </View>

        {formattedAccountNumber && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{t('card.balance_account')}</Text>
            <Text style={styles.metaValue}>{formattedAccountNumber}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.main_bule,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.grey3,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.grey3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default CardBalanceSection;


