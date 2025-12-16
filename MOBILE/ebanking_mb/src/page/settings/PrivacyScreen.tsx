import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import Colors from '../../constants/color';
import ComingSoonModal from '../../components/ComingSoonModal';

interface PrivacyOptionProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showComingSoon?: boolean;
}

const PrivacyOption: React.FC<PrivacyOptionProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
  showComingSoon = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      {showComingSoon ? (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      ) : (
        <Icon name="chevron-forward" size={20} color={Colors.grey3} />
      )}
    </TouchableOpacity>
  );
};

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  const handleDeleteAccount = () => {
    setShowComingSoonModal(true);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('privacy.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('privacy.subtitle')}</Text>

        {/* Change Password Option */}
        <PrivacyOption
          icon="lock-closed"
          iconColor={Colors.main_bule}
          iconBgColor={Colors.main_bule + '15'}
          title={t('privacy.change_password')}
          subtitle={t('privacy.change_password_subtitle')}
          onPress={handleChangePassword}
        />

        {/* Delete Account Option */}
        <PrivacyOption
          icon="trash-outline"
          iconColor={Colors.error}
          iconBgColor={Colors.error + '15'}
          title={t('privacy.delete_account')}
          subtitle={t('privacy.delete_account_subtitle')}
          onPress={handleDeleteAccount}
          showComingSoon={true}
        />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon
            name="information-circle-outline"
            size={20}
            color={Colors.main_bule}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{t('privacy.subtitle')}</Text>
        </View>
      </ScrollView>

      <ComingSoonModal
        visible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
      />
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
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey3,
    marginBottom: 20,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.grey3,
    lineHeight: 18,
  },
  comingSoonBadge: {
    backgroundColor: Colors.orange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.orange,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.main_bule + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});

export default PrivacyScreen;
