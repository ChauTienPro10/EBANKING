import React from 'react';
import { View, StyleSheet, ScrollView} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../../hooks/useNavigation';
import { useCommonUI } from '../../hooks/useCommonUI';
import Header from '../../components/Header';
import MenuList from '../../components/MenuList';
import BottomNavigation from '../../components/BottomNavigation';
import Colors from '../../constants/color';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, handleTabChange, handleNotificationPress } = useAppNavigation('settings');
  const { notificationCount, clearNotifications } = useCommonUI();

  const handleQRPress = () => {
    console.log('QR Code pressed - Open QR Scanner');
  };

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'menu', label: t('bottom_navigation.menu'), icon: 'grid' },
    { id: 'settings', label: t('bottom_navigation.settings'), icon: 'settings' },
    { id: 'support', label: t('bottom_navigation.support'), icon: 'help-circle' },
  ];

  const settingsItems = [
    { id: 'language', label: t('settings.language'), icon: 'globe', route: 'language_settings', category: 'general' },
    { id: 'notifications', label: t('settings.notifications'), icon: 'notifications', route: 'notification_settings', category: 'general' },
    { id: 'security', label: t('settings.security'), icon: 'shield', route: 'security_settings', category: 'security' },
    { id: 'biometric', label: t('settings.biometric'), icon: 'fingerprint', route: 'biometric_settings', category: 'security' },
    { id: 'privacy', label: t('settings.privacy'), icon: 'lock', route: 'privacy_settings', category: 'privacy' },
    { id: 'about', label: t('settings.about'), icon: 'information-circle', route: 'about', category: 'info' },
    { id: 'help', label: t('settings.help'), icon: 'help-circle', route: 'help', category: 'info' },
    { id: 'logout', label: t('settings.logout'), icon: 'log-out', route: 'logout', category: 'account' },
  ];

  const handleSettingSelect = (item: any) => {
    console.log('Setting selected:', item);
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
