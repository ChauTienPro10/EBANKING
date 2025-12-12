import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';

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

  // Format to short form: 35000000 => "35tr"
  const formatShort = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}tỷ`;
    }
    if (amount >= 1000000) {
      return `${Math.round(amount / 1000000)}tr`;
    }
    return `${Math.round(amount / 1000)}k`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HẠN MỨC THẺ</Text>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>
            {spentPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarFill, { width: `${spentPercentage}%` }]}
        />
      </View>

      {/* Compact Ratio Display */}
      <Text style={styles.limitRatio}>
        {formatShort(spentAmount)} / {formatShort(cardLimit)}
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
  percentageBadge: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0F2F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.main_bule,
    borderRadius: 4,
  },
  limitRatio: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
