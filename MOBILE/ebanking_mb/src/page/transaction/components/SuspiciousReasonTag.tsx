import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SuspiciousReason } from '../types/suspiciousTypes';

interface SuspiciousReasonTagProps {
  reason: SuspiciousReason;
  detail?: string | number;
}

const SuspiciousReasonTag: React.FC<SuspiciousReasonTagProps> = ({
  reason,
  detail,
}) => {
  const { t } = useTranslation();

  const getReasonConfig = () => {
    switch (reason) {
      case 'LATE_NIGHT':
        return {
          icon: 'weather-night',
          label: t('suspicious_transactions.reason_late_night'),
          color: '#FF3B30',
          backgroundColor: '#FFEBEE',
        };
      case 'REPEATED_RECIPIENT':
        return {
          icon: 'repeat',
          label: t('suspicious_transactions.reason_repeated'),
          color: '#FF9500',
          backgroundColor: '#FFF3E0',
        };
      case 'LARGE_AMOUNT':
        return {
          icon: 'cash-multiple',
          label: t('suspicious_transactions.reason_large_amount'),
          color: '#FFCC00',
          backgroundColor: '#FFFBEA',
        };
    }
  };

  const config = getReasonConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.color}
      />
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
      {detail && (
        <Text style={[styles.detail, { color: config.color }]}>({detail})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  detail: {
    fontSize: 11,
    fontWeight: '400',
    marginLeft: 2,
  },
});

export default SuspiciousReasonTag;
