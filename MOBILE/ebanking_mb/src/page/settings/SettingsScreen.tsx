import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../../hooks/useNavigation';
import { useCommonUI } from '../../hooks/useCommonUI';
import Header from '../../components/Header';
import MenuList from '../../components/MenuList';
import BottomNavigation from '../../components/BottomNavigation';
import Colors from '../../constants/color';
import { useDispatch } from 'react-redux';
import { setLoginStatus, setLoginResponse } from '../../store/slices/appSlice';
import LogoutConfirmPopup from '../../popups/LogoutPopup';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { activeTab, handleTabChange, handleNotificationPress } =
    useAppNavigation('settings');
  const { notificationCount, clearNotifications } = useCommonUI();
  const dispatch = useDispatch();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

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

  const settingsItems = [
    {
      id: 'language',
      label: t('settings.language'),
      icon: 'globe',
      route: 'language_settings',
      category: 'general',
    },
    {
      id: 'notifications',
      label: t('settings.notifications'),
      icon: 'notifications',
      route: 'notification_settings',
      category: 'general',
    },
    {
      id: 'security',
      label: t('settings.security'),
      icon: 'shield',
      route: 'security_settings',
      category: 'security',
    },
    {
      id: 'biometric',
      label: t('settings.biometric'),
      icon: 'fingerprint',
      route: 'EKYC',
      category: 'security',
    },
    {
      id: 'privacy',
      label: t('settings.privacy'),
      icon: 'lock',
      route: 'privacy_settings',
      category: 'privacy',
    },
    {
      id: 'about',
      label: t('settings.about'),
      icon: 'information-circle',
      route: 'about',
      category: 'info',
    },
    {
      id: 'help',
      label: t('settings.help'),
      icon: 'help-circle',
      route: 'help',
      category: 'info',
    },
    {
      id: 'logout',
      label: t('settings.logout'),
      icon: 'log-out',
      route: 'logout',
      category: 'account',
    },
  ];

  const handleLogout = () => {
    dispatch(setLoginResponse(null));
    dispatch(setLoginStatus(false));
  };

  const handleSettingSelect = (item: any) => {
    switch (item.id) {
      case 'logout':
        setShowLogoutPopup(true);
        break;
      case 'security':
        break;
      case 'biometric':
        if (item.route === 'EKYC') {
          navigation.navigate('EKYC' as never);
        }

      default:
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
          clearNotifications();
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <MenuList
          items={settingsItems}
          onSelect={handleSettingSelect}
          showCategories={true}
        />
      </ScrollView>

      <LogoutConfirmPopup
        visible={showLogoutPopup}
        onCancel={() => setShowLogoutPopup(false)}
        onConfirm={handleLogout}
      />
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
    backgroundColor: Colors.grey2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
});

export default SettingsScreen;
