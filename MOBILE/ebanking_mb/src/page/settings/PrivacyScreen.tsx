import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components';

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header title={t('privacy.title')} showBackButton />
      <View style={styles.body}>
        <Text style={styles.paragraph}>{t('privacy.intro')}</Text>
        <Text style={styles.subtitle}>{t('privacy.data_collection')}</Text>
        <Text style={styles.paragraph}>{t('privacy.data_details')}</Text>

        <Text style={styles.subtitle}>{t('privacy.security')}</Text>
        <Text style={styles.paragraph}>{t('privacy.security_details')}</Text>

        <Text style={styles.subtitle}>{t('privacy.user_rights')}</Text>
        <Text style={styles.paragraph}>{t('privacy.user_rights_details')}</Text>
      </View>
    </View>
  );
};

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  body: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#00796B',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#004D40',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
});
