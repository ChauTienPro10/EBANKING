import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';

export default function Home() {
  const language = useSelector((state: RootState) => state.app.language);
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.welcome')}</Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey3,
    textAlign: 'center',
  },
});
