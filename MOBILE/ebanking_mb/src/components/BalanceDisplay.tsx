import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';
import TextStyles from '../constants/textStyle';

interface BalanceDisplayProps {
  availableBalance: number;
  ledgerBalance?: number;
  pendingBalance?: number;
  currency?: string;
  showDetails?: boolean;
  isMasked?: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  availableBalance,
  ledgerBalance,
  pendingBalance,
  currency = 'VND',
  showDetails = false,
  isMasked = false,
}) => {
  const { t } = useTranslation();
  const formatCurrency = (amount: number): string => {
    if (isMasked) {
      return t('ui.masked_text');
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAmount = (amount: number): string => {
    if (isMasked) {
      return '••••••••';
    }
    
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainBalance}>
        <Text style={styles.balanceLabel}>{t('labels.available_balance')}</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(availableBalance)}
        </Text>
      </View>
      
      {showDetails && (ledgerBalance !== undefined || pendingBalance !== undefined) && (
        <View style={styles.detailsContainer}>
          {ledgerBalance !== undefined && (
            <View style={styles.balanceRow}>
              <Text style={styles.detailLabel}>{t('labels.ledger_balance')}</Text>
              <Text style={styles.detailAmount}>
                {formatAmount(ledgerBalance)} {currency}
              </Text>
            </View>
          )}
          {pendingBalance !== undefined && (
            <View style={styles.balanceRow}>
              <Text style={styles.detailLabel}>{t('labels.pending_balance')}</Text>
              <Text style={styles.detailAmount}>
                {formatAmount(pendingBalance)} {currency}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  mainBalance: {
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    ...TextStyles.body2,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    ...TextStyles.h2,
    color: Colors.main_bule,
    fontWeight: 'bold',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  detailAmount: {
    ...TextStyles.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});

export default BalanceDisplay;
