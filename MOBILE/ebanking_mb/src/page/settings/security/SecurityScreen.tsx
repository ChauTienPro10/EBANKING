import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../components';
import { useTranslation } from 'react-i18next';

const SecurityScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // 👈 dùng i18n

  const [isSmartOtpEnabled, setSmartOtpEnabled] = useState(false);
  const [isFingerprintEnabled, setFingerprintEnabled] = useState(false);

  const toggleSmartOtp = () => setSmartOtpEnabled(prev => !prev);
  const toggleFingerprint = () => setFingerprintEnabled(prev => !prev);

  type MenuItem = {
    label: string;
    toggle?: boolean;
    value?: boolean;
    onToggle?: () => void;
    route?: string;
  };

  const menu: MenuItem[] = [
    {
      label: t('security.smartOtpEnable'),
      toggle: true,
      value: isSmartOtpEnabled,
      onToggle: toggleSmartOtp,
    },
    { label: t('security.smartOtpChangePin'), route: 'change_pin_otp' },
    { label: t('security.smartOtpForgotPin'), route: 'forgot_pin_otp' },
    { label: t('security.smartOtpSync'), route: 'SyncSmartOtp' },
    { label: t('security.changePinMyvib'), route: 'change_pin_myvib' },
    { label: t('security.changePassword'), route: 'change_password' },
    {
      label: t('security.fingerprintLogin'),
      toggle: true,
      value: isFingerprintEnabled,
      onToggle: toggleFingerprint,
    },
  ];

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => (
    <TouchableOpacity
      disabled={!item.route}
      onPress={() => item.route && navigation.navigate(item.route as never)}
    >
      <View key={index} style={styles.item}>
        <Text style={styles.label}>{item.label}</Text>
        {item.toggle ? (
          <Switch value={item.value} onValueChange={item.onToggle} />
        ) : (
          <Icon name="chevron-forward" size={20} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title={t('security.title')} showBackButton />
      <FlatList data={menu} renderItem={renderItem} style={styles.content} />
    </View>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
});
