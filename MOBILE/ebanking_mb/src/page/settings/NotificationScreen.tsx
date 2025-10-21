import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components';

const NotificationScreen: React.FC = () => {
  const { t } = useTranslation();

  const [transactionNotif, setTransactionNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);
  const [loginNotif, setLoginNotif] = useState(true);

  const handleToggle = (type: string, value: boolean) => {
    if (type === 'transaction') {
      setTransactionNotif(value);
    } else if (type === 'promo') {
      setPromoNotif(value);
    } else if (type === 'login') {
      setLoginNotif(value);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={t('notifications_setting.title')} showBackButton />
<View style={styles.body}>
      <View style={styles.item}>
        <Text style={styles.label}>{t('notifications_setting.transaction')}</Text>
        <Switch
          value={transactionNotif}
          onValueChange={(val) => handleToggle('transaction', val)}
          thumbColor={transactionNotif ? '#00796B' : '#ccc'}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>{t('notifications_setting.promo')}</Text>
        <Switch
          value={promoNotif}
          onValueChange={(val) => handleToggle('promo', val)}
          thumbColor={promoNotif ? '#00796B' : '#ccc'}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>{t('notifications_setting.login')}</Text>
        <Switch
          value={loginNotif}
          onValueChange={(val) => handleToggle('login', val)}
          thumbColor={loginNotif ? '#00796B' : '#ccc'}
        />
      </View>
      </View>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});
