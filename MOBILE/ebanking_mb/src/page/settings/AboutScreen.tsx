import React from 'react';
import { Text,  StyleSheet,  View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header title={t('about.title')} showBackButton />
      <View style={styles.body}>
        <Text style={styles.paragraph}>{t('about.intro1')}</Text>
        <Text style={styles.paragraph}>{t('about.intro2')}</Text>

        <Text style={styles.subtitle}>{t('about.vision')}</Text>
        <Text style={styles.paragraph}>{t('about.visionText')}</Text>

        <Text style={styles.subtitle}>{t('about.version')}</Text>
        <Text style={styles.paragraph}>1.0.0</Text>
      </View>

      <Text style={styles.footer}>
        {t('about.copyright')}
      </Text>
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
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
    marginTop: 20,
    marginBottom: 15,
    color: '#00796B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#004D40',
    alignSelf: 'flex-start',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  footer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
