import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import MenuList from '../../components/MenuList';
import BottomNavigation from '../../components/BottomNavigation';
import SupportButton from '../../components/SupportButton';
import CustomButton from '../../components/CustomButton';
import AccountCard from '../../components/AccountCard';
import Colors from '../../constants/color';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { SearchIcon, BellIcon, UserIcon } from '../../components/icon';

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;

const MenuScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('menu');
  // Use Redux for notification count instead of local state
  const notificationCount = useSelector(
    (state: any) => state.app.notificationCount,
  );

  const mockAccounts = [
    {
      id: t('mock_data.accounts.primary.id'),
      accountNumber: t('mock_data.accounts.primary.accountNumber'),
      accountName: t('mock_data.accounts.primary.accountName'),
      availableBalance: parseInt(
        t('mock_data.accounts.primary.availableBalance'),
      ),
      ledgerBalance: parseInt(t('mock_data.accounts.primary.ledgerBalance')),
      pendingBalance: parseInt(t('mock_data.accounts.primary.pendingBalance')),
      currency: t('mock_data.accounts.primary.currency'),
      cardType: 'primary' as const,
    },
    {
      id: t('mock_data.accounts.savings.id'),
      accountNumber: t('mock_data.accounts.savings.accountNumber'),
      accountName: t('mock_data.accounts.savings.accountName'),
      availableBalance: parseInt(
        t('mock_data.accounts.savings.availableBalance'),
      ),
      ledgerBalance: parseInt(t('mock_data.accounts.savings.ledgerBalance')),
      pendingBalance: parseInt(t('mock_data.accounts.savings.pendingBalance')),
      currency: t('mock_data.accounts.savings.currency'),
      cardType: 'savings' as const,
    },
  ];

  useEffect(() => {
    console.log(t('mock_data.messages.menu_mounted'));
    console.log(t('mock_data.messages.current_tab', { tab: activeTab }));
  }, [activeTab, t]);

  const menuItems = [
    {
      id: 'account_and_card',
      label: t('action_grid.account_and_card'),
      icon: 'card',
      route: 'account_and_card',
      category: 'banking',
    },
    {
      id: 'credit_card',
      label: t('action_grid.credit_card'),
      icon: 'card',
      route: 'credit_card',
      category: 'banking',
    },
    {
      id: 'transaction_report',
      label: t('action_grid.transaction_report'),
      icon: 'list',
      route: 'transaction_report',
      category: 'banking',
    },
    {
      id: 'beneficiary',
      label: t('action_grid.beneficiary'),
      icon: 'people',
      route: 'beneficiary',
      category: 'banking',
    },
    {
      id: 'investments',
      label: t('action_grid.investments'),
      icon: 'trending-up',
      route: 'investments',
      category: 'banking',
    },
    {
      id: 'insurance',
      label: t('action_grid.insurance'),
      icon: 'shield',
      route: 'insurance',
      category: 'banking',
    },

    {
      id: 'profile',
      label: t('profile.title'),
      icon: 'person',
      route: 'profile',
      category: 'personal',
    },
    {
      id: 'settings',
      label: t('settings.title'),
      icon: 'settings',
      route: 'settings',
      category: 'personal',
    },

    {
      id: 'notifications',
      label: t('notifications.title'),
      icon: 'notifications',
      route: 'notifications',
      category: 'support',
    },
    {
      id: 'support',
      label: t('support.title'),
      icon: 'help-circle',
      route: 'support',
      category: 'support',
    },
  ];

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'menu', label: t('bottom_navigation.menu'), icon: 'grid' },
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

  const handleMenuSelect = (item: any) => {
    switch (item.id) {
      case 'profile':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tabId: string) => {
    console.log(
      t('mock_data.messages.tab_changed', { from: activeTab, to: tabId }),
    );
    setActiveTab(tabId);

    if (tabId !== 'menu') {
      console.log(t('mock_data.messages.navigate_to_tab', { tab: tabId }));
      // @ts-ignore
      navigation.navigate(tabId.charAt(0).toUpperCase() + tabId.slice(1));
    }
  };

  const handleLogout = () => {
    console.log(t('mock_data.messages.logout_pressed'));
    Alert.alert(t('menu.logout'), t('mock_data.messages.logout_confirm'), [
      {
        text: t('mock_data.messages.cancel'),
        style: 'cancel',
        onPress: () => console.log(t('mock_data.messages.logout_cancelled')),
      },
      {
        text: t('menu.logout'),
        style: 'destructive',
        onPress: () => {
          console.log(t('mock_data.messages.logout_success'));
        },
      },
    ]);
  };

  const handleSupportPress = () => {
    console.log(t('mock_data.messages.support_pressed'));
    Alert.alert(t('support.title'), t('mock_data.messages.support_connecting'));
  };

  const handleQRPress = () => {
    console.log('QR Code pressed - Open QR Scanner');
  };

  const handleNotificationPress = () => {
    console.log(t('mock_data.messages.notification_pressed'));
    // Notification count is managed by Redux in NotiScreen
    // @ts-ignore
    navigation.navigate('Notifications');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                {t('ui.bank_name').toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <SearchIcon size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleNotificationPress}
            >
              <BellIcon size={20} color={Colors.white} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarContainer}>
                <UserIcon size={24} color={Colors.white} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileGreeting}>
                  {t('greetings.hello_user', {
                    name: t('mock_data.user.name'),
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.accountsContainer}>
          {mockAccounts.map(account => (
            <AccountCard
              key={account.id}
              accountNumber={account.accountNumber}
              accountName={account.accountName}
              availableBalance={account.availableBalance}
              ledgerBalance={account.ledgerBalance}
              pendingBalance={account.pendingBalance}
              currency={account.currency}
              cardType={account.cardType}
              onPress={() =>
                handleMenuSelect({
                  id: 'account_and_card',
                  label: t('action_grid.account_and_card'),
                  route: 'account_and_card',
                })
              }
              showMaskToggle={true}
            />
          ))}
        </View>

        <MenuList
          items={menuItems}
          onSelect={handleMenuSelect}
          showCategories={true}
        />

        <View style={styles.logoutContainer}>
          <CustomButton
            title={t('menu.logout')}
            variant="outline"
            onPress={handleLogout}
            containerStyle={styles.logoutButton}
          />
        </View>
      </ScrollView>

      <SupportButton
        label={t('support.chatbot')}
        onPress={handleSupportPress}
        variant="floating"
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
    backgroundColor: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.main_bule,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileLeft: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  profileSubtext: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  accountsContainer: {
    paddingBottom: 10,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoutButton: {
    marginTop: 10,
  },
});

export default MenuScreen;
