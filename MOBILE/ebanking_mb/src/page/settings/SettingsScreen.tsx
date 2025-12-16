import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../../hooks/useNavigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import Colors from '../../constants/color';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setLoginStatus,
  setLoginResponse,
  setAccountTransResponse,
} from '../../store/slices/appSlice';
import LogoutConfirmPopup from '../../popups/LogoutPopup';
import LanguagePopup from '../../popups/LanguagePopup';
import ComingSoonModal from '../../components/ComingSoonModal';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MenuList } from '../../components';
import PinInput from '../../components/PinInput';
import Toast from 'react-native-toast-message';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showArrow?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}) => {
  const handlePress = () => {
    if (!showToggle && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={handlePress}
      disabled={showToggle}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={22} color={Colors.main_bule} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: Colors.grey2, true: Colors.main_bule + '50' }}
          thumbColor={toggleValue ? Colors.main_bule : Colors.grey3}
        />
      ) : showArrow ? (
        <Icon name="chevron-forward" size={20} color={Colors.grey3} />
      ) : null}
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return <Text style={styles.sectionHeader}>{title}</Text>;
};

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const notificationCount = useSelector(
    (state: RootState) => state.app.notificationCount,
  );
  const pinStatus = useSelector((state: RootState) => state.app.pinStatus);

  const { activeTab, handleTabChange, handleNotificationPress } =
    useAppNavigation('settings');
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );

  const handleQRPress = () => {
    console.log('QR Code pressed - Open QR Scanner');
  };

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'card', label: t('bottom_navigation.card'), icon: 'card' },
    {
      id: 'settings',
      label: t('bottom_navigation.settings'),
      icon: 'settings',
    },
    {
      id: 'support',
      label: t('bottom_navigation.support'),
      icon: 'help-circle',
    },
  ];

  const handleLogout = () => {
    dispatch(setLoginResponse(null));
    dispatch(setLoginStatus(false));
    dispatch(setAccountTransResponse(null));
  };

  const getCurrentLanguageSubtitle = () => {
    return i18n.language === 'vi' ? t('settings.vi') : t('settings.en');
  };

  const handlePinToggle = (value: boolean) => {
    // Navigate to SetPINCode screen
    // The PinInput component will handle both create and delete based on current status
    navigation.navigate('SetPINCode' as never);
  };

  const handlePrivacyPress = () => {
    if (pinStatus !== true) {
      // If PIN is not set, show toast and redirect to PIN setup
      Toast.show({
        type: 'info',
        text1: t('privacy.pin_required_title'),
        text2: t('privacy.pin_required_message'),
      });
      navigation.navigate('SetPINCode' as never);
      return;
    }
    // Show PIN modal for authentication
    setIsVerifyingPin(false);
    setPinInputKey(prev => prev + 1);
    setShowPinModal(true);
  };

  const handlePinComplete = async (pin: string) => {
    if (isVerifyingPin) {
      return;
    }

    if (!loginResponse?.username) {
      Toast.show({
        type: 'error',
        text1: t('err.user_not_found'),
      });
      return;
    }

    setIsVerifyingPin(true);

    try {
      const payload = {
        username: loginResponse.username,
        pinCode: pin,
      };

      const response = await fetch.post(API.CHECK_PIN, payload, true);

      if (!response) {
        throw new Error('PIN verification failed');
      }

      setShowPinModal(false);
      // Navigate to Privacy screen after successful PIN verification
      navigation.navigate('Privacy' as never);
    } catch (error: any) {
      const message =
        typeof error?.message === 'string'
          ? error.message.replace('INTERNAL: ', '')
          : 'PIN verification failed';

      Toast.show({
        type: 'error',
        text1: t('err.pin_not_true'),
        text2: message,
      });

      setPinInputKey(prev => prev + 1);
    } finally {
      setIsVerifyingPin(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('settings.title')}
        showBackButton={false}
        showNotification={true}
        notificationCount={notificationCount}
        onNotificationPress={() => {
          handleNotificationPress();
          navigation.navigate('Notifications' as never);
        }}
        iconSize={20}
        badgeSize={16}
        badgeColor={Colors.orange}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Account Section */}
        <SectionHeader title={t('settings.section_account')} />
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            title={t('settings.account_title')}
            subtitle={t('settings.account_subtitle')}
            onPress={() => navigation.navigate('Profile' as never)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="notifications-outline"
            title={t('settings.notifications')}
            subtitle={t('settings.notifications_subtitle')}
            onPress={() => navigation.navigate('Notifications' as never)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="globe-outline"
            title={t('settings.language')}
            subtitle={getCurrentLanguageSubtitle()}
            onPress={() => setShowLanguagePopup(true)}
          />
        </View>

        {/* Security & Privacy Section */}
        <SectionHeader title={t('settings.section_security')} />
        <View style={styles.section}>
          <SettingItem
            icon="shield-checkmark-outline"
            title={t('settings.security')}
            subtitle={t('settings.security_subtitle')}
            showToggle={true}
            toggleValue={pinStatus === true}
            onToggleChange={handlePinToggle}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="fingerprint"
            title={t('settings.biometric')}
            subtitle={t('settings.biometric_subtitle')}
            onPress={() => navigation.navigate('EKYC' as never)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="lock-closed-outline"
            title={t('settings.privacy')}
            subtitle={t('settings.privacy_subtitle')}
            onPress={handlePrivacyPress}
          />
        </View>

        {/* About Section */}
        <SectionHeader title={t('settings.section_about')} />
        <View style={styles.section}>
          <SettingItem
            icon="information-circle-outline"
            title={t('settings.about')}
            subtitle={t('settings.about_subtitle')}
            onPress={() => setShowComingSoonModal(true)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="help-circle-outline"
            title={t('settings.help')}
            subtitle={t('settings.help_subtitle')}
            onPress={() => setShowComingSoonModal(true)}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutPopup(true)}
        >
          <Icon name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionInfo}>{t('settings.version_info')}</Text>
      </ScrollView>

      <LogoutConfirmPopup
        visible={showLogoutPopup}
        onCancel={() => setShowLogoutPopup(false)}
        onConfirm={handleLogout}
      />
      <LanguagePopup
        visible={showLanguagePopup}
        onClose={() => setShowLanguagePopup(false)}
      />
      <ComingSoonModal
        visible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
      />

      {/* PIN Modal for Privacy Access */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>
              {t('privacy.pin_required_title')}
            </Text>
            <Text style={styles.pinModalSubtitle}>
              {isVerifyingPin
                ? t('card.pin_modal_verifying')
                : t('privacy.pin_required_message')}
            </Text>
            <PinInput
              key={pinInputKey}
              length={4}
              onComplete={handlePinComplete}
              create={false}
              hasBiometric={false}
            />
            <TouchableOpacity
              style={styles.pinModalCancel}
              onPress={() => setShowPinModal(false)}
            >
              <Text style={styles.pinModalCancelText}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavigation
        activeTab={activeTab}
        tabs={bottomTabs}
        onChange={handleTabChange}
        onQRPress={handleQRPress}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.main_bule + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.grey3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  versionInfo: {
    fontSize: 12,
    color: Colors.grey3,
    textAlign: 'center',
    marginTop: 24,
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: Colors.grey3,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinModalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pinModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grey3,
  },
});

export default SettingsScreen;
