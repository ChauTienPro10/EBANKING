import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import { formatCurrency } from '../mockCardData';

interface CardLimitSectionProps {
  spentAmount: number;
  cardLimit: number;
}

export const CardLimitSection: React.FC<CardLimitSectionProps> = ({
  spentAmount,
  cardLimit,
}) => {
  const { t } = useTranslation();
  const spentPercentage = (spentAmount / cardLimit) * 100;
  const remainingAmount = cardLimit - spentAmount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('card.card_limit')}</Text>
        <View style={styles.percentageChip}>
          <Text style={styles.percentageText}>
            {spentPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>{t('card.spent')}</Text>
          <Text style={styles.spentAmount}>{formatCurrency(spentAmount)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>{t('card.remaining')}</Text>
          <Text style={styles.remainingAmount}>
            {formatCurrency(remainingAmount)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${spentPercentage}%` }]}
          />
        </View>
      </View>

      {/* Limit Info */}
      <Text style={styles.limitInfo}>
        {t('card.total_limit')}: {formatCurrency(cardLimit)}
      </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  percentageChip: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 13,
    color: Colors.grey3,
    fontWeight: '500',
  },
  spentAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  remainingAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.main_green,
    letterSpacing: -0.3,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.grey2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.main_bule,
    borderRadius: 3,
  },
  limitInfo: {
    fontSize: 12,
    color: Colors.grey3,
    textAlign: 'center',
    fontWeight: '500',
  },
});
