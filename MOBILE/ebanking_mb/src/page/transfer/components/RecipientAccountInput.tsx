import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import CustomInput from '../../../components/CustomInput';
import CheckBox from '../../../components/CheckBox';
import { PersonIcon } from '../../../components/icon';

interface RecipientAccountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  saveRecipient: boolean;
  onSaveChange: (value: boolean) => void;
  hasSavedAccounts: boolean;
  onShowSavedAccounts: () => void;
}

const RecipientAccountInput: React.FC<RecipientAccountInputProps> = ({
  value,
  onChange,
  error,
  saveRecipient,
  onSaveChange,
  hasSavedAccounts,
  onShowSavedAccounts,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.recipientAccountHeader}>
        {hasSavedAccounts && (
          <TouchableOpacity
            style={styles.savedAccountsButton}
            onPress={onShowSavedAccounts}
          >
            <Text style={styles.savedAccountsButtonText}>
              {t('transfer.saved_accounts')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <CustomInput
        placeholder={t('transfer.recipient_account_placeholder')}
        value={value}
        onChangeText={onChange}
        error={error}
        leftIcon={<PersonIcon size={20} color={Colors.grey3} />}
        keyboardType="numeric"
        maxLength={16}
      />
      <View style={styles.saveAccountContainer}>
        <CheckBox checked={saveRecipient} onChange={onSaveChange} />
        <Text
          style={styles.saveAccountText}
          onPress={() => onSaveChange(!saveRecipient)}
        >
          {t('transfer.save_recipient_account')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  recipientAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  savedAccountsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  savedAccountsButtonText: {
    ...TextStyles.systemLight_14,
    color: Colors.main_bule,
    marginLeft: 6,
    fontWeight: '600',
  },
  saveAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  saveAccountText: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default RecipientAccountInput;
