import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

const BiometricScreen: React.FC = () => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean>(false);

  const toggleBiometric = (value: boolean) => {
    setEnabled(value);

    if (value) {
      // Gọi SDK kiểm tra sinh trắc học ở đây
      Alert.alert(t('biometric.activated'));
    } else {
      Alert.alert(t('biometric.deactivated'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('biometric.title')}</Text>
      <Text style={styles.description}>{t('biometric.description')}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t('biometric.enable_label')}</Text>
        <Switch
          value={enabled}
          onValueChange={toggleBiometric}
          thumbColor={enabled ? '#00796B' : '#ccc'}
        />
      </View>
    </View>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop:40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#000',
  },
});
