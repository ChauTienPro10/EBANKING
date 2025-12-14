import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setOnboardingDismissed } from '../../store/slices/appSlice';
import ReminderPopup from '../../popups/ReminderPopupProps';
import OnboardingModal from '../../components/OnboardingModal';
import ComingSoonModal from '../../components/ComingSoonModal';
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
  const pinStatus = useSelector((state: RootState) => state.app.pinStatus);
  const modalSession = useSelector(
    (state: RootState) => state.app.modalDismissalSession,
  );

  // Local state
  const { t } = useTranslation();
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [requireUpdateInfo, setRequireUpdateInfo] = React.useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = React.useState(false);

  // Custom hooks
  const { quickActions, services, bottomTabs } = useHomeData();
  const {
    balanceCardScale,
    balanceCardOpacity,
    balanceCardTranslateY,
    balanceCardHeight,
    headerPaddingBottom,
    handleScroll,
  } = useBalanceCardAnimation();
  const {
    handleActionPress,
    handleServicePress,
    handleQRPress,
    handleOpenCard,
    navigation,
  } = useHomeNavigation(account, userInfo, () => setShowComingSoonModal(true));
  const dispatch = useDispatch();

  // Effects
  useEffect(() => {
    // Check if user needs to complete eKYC or PIN setup
    const ekycIncomplete =
      !userInfo?.ekycStatus || userInfo.ekycStatus !== 'VERIFIED';
    const pinIncomplete = pinStatus !== true;

    // Check if user just performed PIN action (within last 3 seconds)
    const justPerformedPinAction =
      modalSession.lastPinActionTime &&
      Date.now() - modalSession.lastPinActionTime < 3000;

    // Don't show if user dismissed or just performed PIN action
    if (
      !modalSession.onboardingDismissed &&
      !justPerformedPinAction &&
      (ekycIncomplete || pinIncomplete)
    ) {
      const timer = setTimeout(() => {
        setShowOnboardingModal(true);
      }, 350);

      return () => clearTimeout(timer);
    } else {
      setShowOnboardingModal(false);
    }
  }, [userInfo, pinStatus, modalSession]);

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

      <OnboardingModal
        visible={showOnboardingModal}
        onClose={() => {
          setShowOnboardingModal(false);
          dispatch(setOnboardingDismissed(true));
        }}
        ekycCompleted={userInfo?.ekycStatus === 'VERIFIED'}
        pinCompleted={pinStatus === true}
        onNavigateToEKYC={() => {
          setShowOnboardingModal(false);
          dispatch(setOnboardingDismissed(true));
          navigation.navigate('EKYC' as never);
        }}
        onNavigateToPIN={() => {
          setShowOnboardingModal(false);
          dispatch(setOnboardingDismissed(true));
          navigation.navigate('SetPINCode' as never);
        }}
      />

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
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
          balanceCardScale={balanceCardScale}
          balanceCardOpacity={balanceCardOpacity}
          balanceCardTranslateY={balanceCardTranslateY}
          balanceCardHeight={balanceCardHeight}
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
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        nestedScrollEnabled={false}
      >
        <QuickActions
          actions={quickActions}
          onActionPress={handleActionPress}
          moreActionsLabel={t('ui.more_actions')}
        />

        <ServicesGrid
          services={services}
          onServicePress={handleServicePress}
          titleLabel={t('labels.services_title')}
        />
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        tabs={bottomTabs}
        onChange={handleTabChange}
        onQRPress={handleQRPress}
      />

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
