import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import { ChevronDownIcon } from '../../../components/icon';
import { Bank } from '../types/transfer.types';

interface BankSelectorProps {
  selectedBank?: Bank;
  onPress: () => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  selectedBank,
  onPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('transfer.select_bank')}</Text>
      <TouchableOpacity style={styles.bankSelector} onPress={onPress}>
        <View style={styles.bankSelectorContent}>
          <View style={styles.bankSelectorLeft}>
            {selectedBank?.logo && (
              <View style={styles.bankSelectorLogoContainer}>
                {React.createElement(selectedBank.logo, {
                  size: 20,
                  color: Colors.main_bule,
                })}
              </View>
            )}
            <View style={styles.bankInfo}>
              <Text style={styles.bankCode}>{selectedBank?.code || '---'}</Text>
              <Text style={styles.bankName} numberOfLines={1}>
                {selectedBank?.name || t('transfer.select_bank_placeholder')}
              </Text>
            </View>
          </View>
          <ChevronDownIcon size={20} color={Colors.grey3} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...TextStyles.systemBold_18,
    color: Colors.textPrimary,
    marginBottom: 18,
    fontWeight: '700',
  },
  bankSelector: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bankSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankSelectorLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankCode: {
    ...TextStyles.systemBold_16,
    color: Colors.main_bule,
    marginBottom: 4,
    fontWeight: '700',
  },
  bankName: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
  },
});

export default BankSelector;
