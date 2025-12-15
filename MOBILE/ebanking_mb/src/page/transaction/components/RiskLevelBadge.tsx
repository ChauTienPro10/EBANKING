import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RiskLevel } from '../types/suspiciousTypes';

interface RiskLevelBadgeProps {
  riskLevel: RiskLevel;
  size?: 'small' | 'medium' | 'large';
}

const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  riskLevel,
  size = 'medium',
}) => {
  const { t } = useTranslation();

  const getColors = () => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          background: '#FFEBEE',
          text: '#FF3B30',
          border: '#FF3B30',
        };
      case 'MEDIUM':
        return {
          background: '#FFF3E0',
          text: '#FF9500',
          border: '#FF9500',
        };
      case 'LOW':
        return {
          background: '#FFFBEA',
          text: '#FFCC00',
          border: '#FFCC00',
        };
    }
  };

  const getLabel = () => {
    switch (riskLevel) {
      case 'HIGH':
        return t('suspicious_transactions.risk_level_high');
      case 'MEDIUM':
        return t('suspicious_transactions.risk_level_medium');
      case 'LOW':
        return t('suspicious_transactions.risk_level_low');
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          fontSize: 12,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default RiskLevelBadge;
