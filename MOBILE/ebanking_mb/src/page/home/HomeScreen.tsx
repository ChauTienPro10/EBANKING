import React, { useEffect } from 'react';
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
  const notificationCount = useSelector(
    (state: RootState) => state.app.notificationCount,
  );

  // Local state
  const { t } = useTranslation();
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [requireUpdateInfo, setRequireUpdateInfo] = React.useState(false);

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

  // // Effects
  // useEffect(() => {
  //   if (
  //     userInfo === null ||
  //     userInfo === undefined ||
  //     userInfo?.fullName === '' ||
  //     userInfo?.birthday === '' ||
  //     userInfo?.address === '' ||
  //     userInfo.ekycStatus !== 'VERIFIED'
  //   ) {
  //     setRequireUpdateInfo(true);
  //   }
  // }, [userInfo]);

  // Event handlers
  const handleNotificationPress = () => {
    console.log(t('mock_data.messages.notification_pressed'));
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
        message={t('home.update_info_required')}
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
          userAvatarUrl={userInfo?.avatarUrl}
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
});

export default HomeScreen;
