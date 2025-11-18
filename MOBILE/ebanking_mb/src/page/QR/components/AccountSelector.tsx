import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import QRColors from '../styles/colors';
import TextStyles from '../../../constants/textStyle';

interface AccountSelectorProps {
  accountName: string;
  balance: string;
  onPress?: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accountName,
  balance,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thanh toán từ</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={styles.accountName}>{accountName}</Text>
          <Text style={styles.balance}>{balance}</Text>
        </View>
        <Icon name="chevron-down" size={20} color={QRColors.textLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    color: QRColors.textSecondary,
    marginBottom: 8,
    fontWeight: '400',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: QRColors.textPrimary,
  },
  balance: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: QRColors.textSecondary,
    marginTop: 2,
  },
});

export default AccountSelector;
