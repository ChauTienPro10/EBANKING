import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Touchable, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/color';
import { TransferIcon, CashIcon, ReceiptIcon, MobileIcon, TrendingUpIcon, BellIcon, EyeIcon, EyeOffIcon, SearchIcon, CardIcon, AirplaneIcon, GameControllerIcon, WifiIcon, UserIcon } from '../../components/icon';
import BottomNavigation from '../../components/BottomNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch, store } from '../../store';
import ReminderPopup from '../../popups/ReminderPopupProps';
import { PersonIcon } from '../../components/icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const HomeScreen: React.FC = () => {
  const loginResponse = useSelector((state: RootState) => state.app.loginResponse);
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const account = useSelector((state: RootState) => state.app.accountTransResponse);
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState(3);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [requireUpdateInfo, setRequireUpdateInfo] = useState(false);


  const quickActions = [
    { id: 'transfer', title: t('action_grid.transfer'), icon: 'transfer', color: Colors.main_bule, tag: null },
    { id: 'withdraw', title: t('action_grid.withdraw'), icon: 'cash', color: Colors.main_green, tag: null },
    { id: 'trans_history', title: t('action_grid.pay_history'), icon: 'receipt', color: Colors.orange, tag: null },
    { id: 'mobile_prepaid', title: t('action_grid.mobile_prepaid'), icon: 'mobile', color: Colors.purple, tag: null },
    { id: 'profile', title: t('action_grid.profile'), icon: 'person', color: Colors.main_bule, tag: null },
    { id: 'loan', title: t('action_grid.loan'), icon: 'cash', color: Colors.main_green, tag: t('home.wind_tag') },
  ];

  const services = [
    { id: 'lottery', title: t('home.lottery_king'), icon: 'game-controller', color: Colors.orange },
    { id: 'data', title: t('home.data_4g'), icon: 'wifi', color: Colors.main_bule },
    { id: 'game', title: t('home.game_card'), icon: 'game-controller', color: Colors.purple },
    { id: 'flight', title: t('home.flight_tickets'), icon: 'airplane', color: Colors.main_green },
  ];

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'menu', label: t('bottom_navigation.menu'), icon: 'grid' },
    { id: 'settings', label: t('bottom_navigation.settings'), icon: 'settings' },
    { id: 'support', label: t('bottom_navigation.support'), icon: 'help-circle' },
  ];



  useEffect(() => {
    if (userInfo?.fullName === '' || userInfo?.birthday === '' || userInfo?.address === '') {
      setRequireUpdateInfo(true);
    }
  }, [userInfo])

  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { size: 24, color: color };

    switch (iconName) {
      case 'transfer': return <TransferIcon {...iconProps} />;
      case 'cash': return <CashIcon {...iconProps} />;
      case 'receipt': return <ReceiptIcon {...iconProps} />;
      case 'mobile': return <MobileIcon {...iconProps} />;
      case 'card': return <CardIcon {...iconProps} />;
      case 'game-controller': return <GameControllerIcon {...iconProps} />;
      case 'wifi': return <WifiIcon {...iconProps} />;
      case 'airplane': return <AirplaneIcon {...iconProps} />;
      case 'person': return <PersonIcon {...iconProps} />;
      default: return <TransferIcon {...iconProps} />;
    }
  };

  const handleActionPress = (action: any) => {
    console.log(t('mock_data.messages.action_pressed', { action: action.title }));

    switch (action.id) {
      case 'transfer':
        if (account) {
          navigation.navigate('Transfer', { receiver: '', amount: '', content: '', bankCode: '' });
        } else {
          navigation.navigate('OpenCard', { userInfo })
        }
        break;
      case 'withdraw':
        console.log('Navigate to withdraw screen');
        break;
      case 'trans_history':
        console.log('Navigate to pay bill screen');
        navigation.navigate('TransactionHistoryScreen' as never);
        break;
      case 'mobile_prepaid':
        console.log('Navigate to mobile prepaid screen');
        break;
      case 'profile':
        navigation.navigate("Profile" as never);
        break;
      case 'loan':
        console.log('Navigate to loan screen');
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  };

  const handleScanSuccess = (value: string) => {
    console.log('QR Code scanned:', value);
  };

  const handleQRPress = () => {
    navigation.navigate('ScannerScreen', { onScanSuccess: handleScanSuccess });
  };

  const handleNotificationPress = () => {
    console.log(t('mock_data.messages.notification_pressed'));
    setNotificationCount(0);
  };

  const handleTabChange = (tabId: string) => {
    console.log(t('mock_data.messages.tab_changed', { from: activeTab, to: tabId }));

    if (tabId !== activeTab) {
      setActiveTab(tabId);

      switch (tabId) {
        case 'home':
          break;
        case 'menu':
          navigation.navigate('Menu' as never);
          break;
        case 'settings':
          navigation.navigate('Settings' as never);
          break;
        case 'support':
          navigation.navigate('Support' as never);
          break;
        default:
          console.log(t('mock_data.messages.unknown_tab', { tab: tabId }));
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
          navigation.navigate("Profile" as never);
        }}
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>{t('ui.bank_name').toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <SearchIcon size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleNotificationPress}>
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
                <Text style={styles.profileGreeting}>{t('greetings.hello_user', { name: loginResponse?.fullName || loginResponse?.username })}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            {account != null && <Text style={styles.balanceTitle}>{t('labels.total_balance')}</Text>}
            {account === null && <TouchableOpacity>
              <Text style={styles.balanceTitle}>{t('labels.you_not_has_card')}</Text>
            </TouchableOpacity>}
          </View>
          <View style={styles.balanceAmount}>
            {isBalanceVisible ? <Text style={styles.balanceText}>
              {account?.balance.toLocaleString('en-US') + ' VND'}
            </Text> :
              <TouchableOpacity onPress={() => navigation.navigate('OpenCard', { userInfo })}>
                <Text style={styles.balanceTextOpenAccount}>
                  {account === null ? t('labels.open_account_now') : "*,***,***"}
                </Text>
              </TouchableOpacity>
            }

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            >
              {isBalanceVisible ? <EyeOffIcon size={20} color={Colors.white} /> : <EyeIcon size={20} color={Colors.white} />}
            </TouchableOpacity>
          </View>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>{t('home.card_management')}</Text>
            <CardIcon size={16} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActionsContainer}>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                {action.tag && (
                  <View style={[styles.actionTag, { backgroundColor: action.color }]}>
                    <Text style={styles.actionTagText}>{action.tag}</Text>
                  </View>
                )}
                <View style={styles.actionIconContainer}>
                  {getIconComponent(action.icon, action.color)}
                </View>
                <Text style={styles.actionText}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.moreActionsIndicator}>
            <Text style={styles.moreActionsText}>{t('ui.more_actions')}</Text>
          </View>
        </View>


        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>{t('labels.services_title')}</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => console.log('Service pressed:', service)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  {getIconComponent(service.icon, Colors.white)}
                </View>
                <Text style={styles.serviceText}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  balanceArrow: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 4,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceFooterText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
  }
});

export default HomeScreen;
