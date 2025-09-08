import React, {useEffect} from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store'; 
import {useTranslation} from 'react-i18next';

export default function Home() {
  const language = useSelector((state: RootState) => state.app.language);
  const {t, i18n} = useTranslation();
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
  return (
    <View>
      <Text>{t('text_welcome')}</Text>
      <Text>{t('home.title')}</Text>
      <Text>{t('profile.greeting')}</Text>
    </View>
  );
}
