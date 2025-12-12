import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import CustomInput from '../../../components/CustomInput';
import { CashIcon } from '../../../components/icon';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  quickAmounts?: string[];
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  error,
  quickAmounts = ['100,000', '500,000', '1,000,000', '5,000,000'],
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <CustomInput
        label={t('transfer.amount')}
        placeholder={t('transfer.amount_placeholder')}
        value={value}
        onChangeText={onChange}
        error={error}
        leftIcon={<CashIcon size={20} color={Colors.grey3} />}
        keyboardType="numeric"
      />

      <View style={styles.quickAmountContainer}>
        <Text style={styles.quickAmountLabel}>
          {t('transfer.quick_amount')}
        </Text>
        <View style={styles.quickAmountButtons}>
          {quickAmounts.map(amount => (
            <TouchableOpacity
              key={amount}
              style={styles.quickAmountButton}
              onPress={() => onChange(amount)}
            >
              <Text style={styles.quickAmountText}>{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  quickAmountContainer: {
    marginTop: 20,
  },
  quickAmountLabel: {
    ...TextStyles.systemLight_14,
    color: Colors.textSecondary,
    marginBottom: 14,
    fontWeight: '500',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAmountText: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});

export default AmountInput;
