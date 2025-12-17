import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { formatCurrencyByLanguage, convertVNDtoUSD } from '../../../utils/currency';

interface StatisticsCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  subtitle?: string;
  isCount?: boolean; // For transaction count (no currency)
  currency?: 'VND' | 'USD';
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  icon,
  label,
  value,
  color,
  subtitle,
  isCount = false,
  currency,
}) => {
  const getFormattedValue = () => {
    if (isCount) return value.toString();

    // If currency override is provided
    if (currency === 'USD') {
      const usdVal = convertVNDtoUSD(value);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(usdVal);
    } else if (currency === 'VND') {
      return `${value.toLocaleString('vi-VN')} đ`;
    }

    // Default fallback to language-based
    return formatCurrencyByLanguage(value);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={2}>
        {getFormattedValue()}
      </Text>
      {isCount && subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default StatisticsCard;
