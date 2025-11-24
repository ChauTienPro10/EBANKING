import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ReminderPopup from '../../popups/ReminderPopupProps';
import Colors from '../../constants/color';
import BottomNavigation from '../../components/BottomNavigation';
import HomeHeader from './components/HomeHeader';
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import ServicesGrid from './components/ServicesGrid';
import {
  useHomeData,
  useBalanceCardAnimation,
  useHomeNavigation,
} from './hooks';

const HomeScreen: React.FC = () => {
  // Redux state
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );

  // Local state
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState(3);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [requireUpdateInfo, setRequireUpdateInfo] = useState(false);

  // Custom hooks
  const { quickActions, services, bottomTabs } = useHomeData();
  const {
    balanceCardHeight,
    balanceCardOpacity,
    headerPaddingBottom,
    headerBorderRadius,
    handleScroll,
  } = useBalanceCardAnimation();
  const {
    handleActionPress,
    handleServicePress,
    handleQRPress,
    handleOpenCard,
    navigation,
  } = useHomeNavigation(account, userInfo);

  // Effects
  useEffect(() => {
    if (
      userInfo?.fullName === '' ||
      userInfo?.birthday === '' ||
      userInfo?.address === ''
    ) {
      setRequireUpdateInfo(true);
    }
  }, [userInfo]);

  // Event handlers
  const handleNotificationPress = () => {
    console.log(t('mock_data.messages.notification_pressed'));
    setNotificationCount(0);
    navigation.navigate('Notifications' as never);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);

      switch (tabId) {
        case 'card':
          navigation.navigate('Card' as never);
          break;
        case 'settings':
          navigation.navigate('Settings' as never);
          break;
        case 'support':
          navigation.navigate('Support' as never);
          break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <ReminderPopup
        visible={requireUpdateInfo}
        message="Vui lòng cập nhật đầy đủ thông tin"
        onClose={() => {
          setRequireUpdateInfo(false);
          navigation.navigate('Profile' as never);
        }}
      />

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            borderBottomLeftRadius: headerBorderRadius,
            borderBottomRightRadius: headerBorderRadius,
          },
        ]}
      >
        <HomeHeader
          bankName={t('ui.bank_name').toUpperCase()}
          userName={t('greetings.hello_user', {
            name: loginResponse?.fullName || loginResponse?.username,
          })}
          notificationCount={notificationCount}
          onNotificationPress={handleNotificationPress}
          headerPaddingBottom={headerPaddingBottom}
        />

        <BalanceCard
          account={account}
          isBalanceVisible={isBalanceVisible}
          onToggleBalance={() => setIsBalanceVisible(!isBalanceVisible)}
          onOpenCard={() => navigation.navigate('OpenCard', { userInfo })}
          balanceCardHeight={balanceCardHeight}
          balanceCardOpacity={balanceCardOpacity}
          totalBalanceLabel={t('labels.total_balance')}
          noCardLabel={t('labels.you_not_has_card')}
          openAccountLabel={t('labels.open_account_now')}
          cardManagementLabel={t('home.card_management')}
        />
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        <QuickActions
          actions={quickActions}
          onActionPress={handleActionPress}
          moreActionsLabel={t('ui.more_actions')}
        />

        <ServicesGrid
          services={services}
          onServicePress={service => console.log('Service pressed:', service)}
          titleLabel={t('labels.services_title')}
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
    backgroundColor: Colors.white,
  },
  headerWrapper: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  actionTag: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  actionTagText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreActionsIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
  moreActionsText: {
    color: Colors.main_bule,
    fontSize: 20,
    fontWeight: 'bold',
  },
  servicesContainer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  servicesTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },

  balanceTextOpenAccount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.main_green,
    // textDecorationLine: 'underline'
  },
});

export default HomeScreen;
