import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components';

const HelpScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header title={t('help.title')} showBackButton />
      <View style={styles.body}>

        <Text style={styles.question}>{t('help.q1')}</Text>
        <Text style={styles.answer}>{t('help.a1')}</Text>

        <Text style={styles.question}>{t('help.q2')}</Text>
        <Text style={styles.answer}>{t('help.a2')}</Text>

        <Text style={styles.question}>{t('help.q3')}</Text>
        <Text style={styles.answer}>{t('help.a3')}</Text>

        <Text style={styles.question}>{t('help.q4')}</Text>
        <Text style={styles.answer}>{t('help.a4')}</Text>
      </View>
      <Text style={styles.footer}>{t('help.footer')}</Text>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#00796B',
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004D40',
    marginTop: 15,
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginLeft: 10,
  },
  footer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
