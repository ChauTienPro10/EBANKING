import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import Colors from '../../constants/color';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      Linking.openURL('tel:0812788212');
    } else {
      Linking.openURL('mailto:itletatthang@gmail.com');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('about.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Icon & Name */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="wallet" size={56} color={Colors.main_bule} />
          </View>
          <Text style={styles.appName}>{t('about.app_name')}</Text>
          <Text style={styles.version}>{t('about.version')}</Text>
        </View>

        {/* Introduction Letter */}
        <View style={styles.letterCard}>
          <Text style={styles.greeting}>{t('about.greeting')}</Text>
          <Text style={styles.description}>{t('about.description')}</Text>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>
              {t('about.features_title')}
            </Text>

            <View style={styles.featureItem}>
              <Icon
                name="shield-checkmark-outline"
                size={20}
                color={Colors.main_bule}
              />
              <Text style={styles.featureText}>
                {t('about.feature_secure')}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Icon name="flash-outline" size={20} color={Colors.main_bule} />
              <Text style={styles.featureText}>{t('about.feature_fast')}</Text>
            </View>

            <View style={styles.featureItem}>
              <Icon name="people-outline" size={20} color={Colors.main_bule} />
              <Text style={styles.featureText}>
                {t('about.feature_support')}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Icon name="globe-outline" size={20} color={Colors.main_bule} />
              <Text style={styles.featureText}>
                {t('about.feature_multicurrency')}
              </Text>
            </View>
          </View>

          <Text style={styles.closing}>{t('about.closing')}</Text>
          <Text style={styles.signature}>{t('about.team')}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>{t('about.contact_title')}</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <Icon name="call-outline" size={20} color={Colors.main_bule} />
            <Text style={styles.contactText}>0812788212</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <Icon name="mail-outline" size={20} color={Colors.main_bule} />
            <Text style={styles.contactText}>itletatthang@gmail.com</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{t('about.copyright')}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: Colors.main_bule + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: Colors.grey3,
  },
  letterCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.grey3,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.grey3,
    marginLeft: 12,
    flex: 1,
  },
  closing: {
    fontSize: 15,
    color: Colors.grey3,
    lineHeight: 24,
    marginBottom: 16,
  },
  signature: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 15,
    color: Colors.grey3,
    marginLeft: 12,
  },
  footer: {
    fontSize: 12,
    color: Colors.grey3,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AboutScreen;
