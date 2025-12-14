import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setCardStatus,
  setPinReminderDismissed,
} from '../../store/slices/appSlice';
import {
  fetchTransactionHistory,
  TransferResponse,
} from '../../store/fetchAPI/TransactionHistory';
import Colors from '../../constants/color';
import BottomNavigation from '../../components/BottomNavigation';
import Header from '../../components/Header';
import {
  CreditCard,
  CardLimitSection,
  TransactionList,
  CardBalanceSection,
} from './components';
import CardDetailBottomSheet from './components/CardDetailBottomSheet';
import { useCardActions } from './hooks/useCardActions';
import { useCardNavigation } from './hooks/useCardNavigation';
import { mockCardData } from './mockCardData';
import MenuDotsIcon from '../../components/icon/MenuDotsIcon';
import LockOpenIcon from '../../components/icon/LockOpenIcon';
import LockIcon from '../../components/icon/LockIcon';
import InfoCircleIcon from '../../components/icon/InfoCircleIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import PinInput from '../../components/PinInput';
import Toast from 'react-native-toast-message';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import ReminderPopup from '../../popups/ReminderPopupProps';

type FilterType = 'all' | 'sent' | 'received';
type PendingAction = 'lock' | 'unlock' | 'access' | null;

const CardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // Get card status from Redux store
  const cardStatus = useSelector((state: RootState) => state.app.cardStatus);
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );

  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );

  // Get real transaction history from Redux
  const transactionHistory = useSelector(
    (state: RootState) => state.transactionHistories.data,
  );
  const transactionLoading = useSelector(
    (state: RootState) => state.transactionHistories.loading,
  );
  const pinStatus = useSelector((state: RootState) => state.app.pinStatus);
  const modalSession = useSelector(
    (state: RootState) => state.app.modalDismissalSession,
  );
  const isFocused = useIsFocused();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [requireSetPin, setRequireSetPin] = useState(false);
  const [userLimits, setUserLimits] = useState<any>(null);

  // Custom hooks
  const { isCardNumberVisible, toggleCardNumberVisibility, copyCardNumber } =
    useCardActions();
  const { activeTab, handleBackPress, handleTabChange, handleQRPress } =
    useCardNavigation();

  React.useEffect(() => {
    console.log('loginResponse', pinStatus);

    // Check if user just performed PIN action (within last 3 seconds)
    const justPerformedPinAction =
      modalSession.lastPinActionTime &&
      Date.now() - modalSession.lastPinActionTime < 3000;

    // Only show reminder if:
    // 1. Screen is focused/active
    // 2. PIN is not set
    // 3. User hasn't dismissed it
    // 4. Not within grace period
    if (
      isFocused &&
      pinStatus !== true &&
      !modalSession.pinReminderDismissed &&
      !justPerformedPinAction
    ) {
      setRequireSetPin(true);
    } else {
      setRequireSetPin(false);
    }
  }, [pinStatus, modalSession, isFocused]);

  // Card data
  // const fullCardNumber = '1237689076545678';
  // const maskedCardNumber = '1237 •••• •••• 5678';
  // const displayCardNumber = '1237 6890 7654 5678';
  // Fetch transaction history when access is granted
  useEffect(() => {
    if (isAccessGranted && loginResponse?.username && account?.accountNumber) {
      dispatch(
        fetchTransactionHistory({
          username: loginResponse.username,
          sender: account.accountNumber,
          page: 1,
          limit: 50,
        }),
      );
      fetchUserLimits();
    }
  }, [
    isAccessGranted,
    loginResponse?.username,
    account?.accountNumber,
    dispatch,
  ]);

  const fetchUserLimits = async () => {
    try {
      const response = await fetch.get(
        `${API.GET_USER_LIMITS}/${userInfo?.id}`,
        {}, // params (empty object)
        true, // authRequire
      );
      if (response) {
        setUserLimits(response);
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '') // bỏ ký tự không phải số
      .replace(/(.{4})/g, '$1 ') // chèn khoảng trắng sau mỗi 4 số
      .trim(); // bỏ khoảng trắng cuối nếu có
  };

  const maskCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, ''); // bỏ hết ký tự không phải số

    if (digits.length < 12) return value; // không đủ số thì giữ nguyên

    const first4 = digits.slice(0, 4);
    const last4 = digits.slice(-4);

    return `${first4} **** **** ${last4}`;
  };

  // Filter transactions based on active filter
  const filteredTransactions = transactionHistory.filter(
    (transaction: TransferResponse) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'sent') {
        return transaction.senderAccountNumber === account?.accountNumber;
      }
      if (activeFilter === 'received') {
        return transaction.receiverAccountNumber === account?.accountNumber;
      }
      return true;
    },
  );

  const openPinModal = useCallback((action: PendingAction) => {
    setPendingAction(action);
    setIsVerifyingPin(false);
    setPinInputKey(prev => prev + 1);
    setShowPinModal(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsAccessGranted(false);
      setShowMenu(false);
      if (pinStatus === true && requireSetPin === false) {
        openPinModal('access');
      }
    }, [openPinModal, pinStatus, requireSetPin]),
  );

  const handlePinComplete = async (pin: string) => {
    if (isVerifyingPin) {
      return;
    }

    if (!loginResponse?.username) {
      Toast.show({
        type: 'error',
        text1: t('card.toast_user_not_found'),
        text2: t('card.toast_login_again'),
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
        throw new Error(
          typeof response?.error === 'string'
            ? response.error
            : 'Xác thực mã PIN thất bại',
        );
      }
      setIsAccessGranted(true);

      setShowPinModal(false);
      setShowMenu(false);
      setPendingAction(null);
    } catch (error: any) {
      const message =
        typeof error?.message === 'string'
          ? error.message.replace('INTERNAL: ', '')
          : 'Xác thực mã PIN thất bại';

      Toast.show({
        type: 'error',
        text1: t('card.toast_wrong_pin'),
        text2: message,
      });

      setPinInputKey(prev => prev + 1);
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleLockToggle = () => {
    openPinModal(cardStatus === 'active' ? 'lock' : 'unlock');
    setShowMenu(false);
  };

  const handleShowDetail = () => {
    setShowDetailSheet(true);
    setShowMenu(false);
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

  const pinModalTitle = () => {
    switch (pendingAction) {
      case 'lock':
        return t('card.pin_modal_lock_title');
      case 'unlock':
        return t('card.pin_modal_unlock_title');
      case 'access':
        return t('card.pin_modal_access_title');
      default:
        return '';
    }
  };

  const pinModalSubtitle = () => {
    if (isVerifyingPin) {
      return t('card.pin_modal_verifying');
    }

    switch (pendingAction) {
      case 'access':
        return t('card.pin_modal_subtitle_access');
      default:
        return t('card.pin_modal_subtitle_default');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title={t('card.title')}
          showBackButton
          onBackPress={handleBackPress}
        />
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <MenuDotsIcon size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLockToggle}
            >
              {cardStatus === 'active' ? (
                <LockIcon size={20} color={Colors.textPrimary} />
              ) : (
                <LockOpenIcon size={20} color={Colors.textPrimary} />
              )}
              <Text style={styles.menuItemText}>
                {cardStatus === 'active'
                  ? t('card.menu_lock_card')
                  : t('card.menu_unlock_card')}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShowDetail}
            >
              <InfoCircleIcon size={20} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>
                {t('card.menu_card_details')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAccessGranted ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            account?.accountNumber
              ? styles.contentContainer
              : styles.contentContainerCentered
          }
        >
          <CardBalanceSection
            balance={account?.balance}
            currency={account?.currency}
            accountNumber={account?.accountNumber}
            accountType={account?.accountType ?? 'SAVINGS'}
          />
          {account?.accountNumber && (
            <>
              <CreditCard
                bankName=".Pay"
                cardNumber={formatCardNumber(account?.accountNumber ?? '')}
                isNumberVisible={isCardNumberVisible}
                maskedNumber={maskCardNumber(account?.accountNumber ?? '')}
                holderName={userInfo?.fullName}
                onNumberPress={toggleCardNumberVisibility}
                onNumberLongPress={() =>
                  copyCardNumber(formatCardNumber(account?.accountNumber ?? ''))
                }
                isLocked={cardStatus === 'locked'}
              />

              <CardLimitSection
                dailyLimit={userLimits?.dailyLimit || 50000000}
                singleLimit={userLimits?.singleTransactionLimit || 10000000}
                usedAmount={userLimits?.usedAmount || 0}
              />
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.lockedContent}>
          <View style={styles.lockedIconContainer}>
            <View style={styles.lockedIconCircle}>
              <Icon name="lock-closed" size={48} color={Colors.main_bule} />
            </View>
          </View>
          <Text style={styles.lockedContentTitle}>
            {t('card.locked_content_title')}
          </Text>
          <Text style={styles.lockedContentSubtitle}>
            {t('card.locked_content_subtitle')}
          </Text>
        </View>
      )}

      <ReminderPopup
        visible={requireSetPin}
        message={t('home.pin_not_set_message')}
        confirmLabel={t('common.set_pin_now')}
        onClose={() => {
          setRequireSetPin(false);
          dispatch(setPinReminderDismissed(true));
          handleTabChange('settings');
        }}
      />
      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>{pinModalTitle()}</Text>
            <Text style={styles.pinModalSubtitle}>{pinModalSubtitle()}</Text>
            <PinInput
              key={pinInputKey}
              length={4}
              onComplete={handlePinComplete}
              create={false}
              hasBiometric={false}
            />
            <TouchableOpacity
              style={styles.pinModalCancel}
              onPress={() => {
                setShowPinModal(false);
                setPendingAction(null);
              }}
            >
              <Text style={styles.pinModalCancelText}>
                {t('card.pin_modal_cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Card Detail Bottom Sheet */}
      {isAccessGranted && (
        <CardDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
        />
      )}

      <BottomNavigation
        activeTab={activeTab}
        tabs={bottomTabs}
        onChange={handleTabChange}
        onQRPress={handleQRPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 18,
    right: 16,
    zIndex: 1000,
    padding: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
    zIndex: 999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  contentContainerCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockedIconContainer: {
    marginBottom: 24,
  },
  lockedIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: `${Colors.main_bule}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${Colors.main_bule}25`,
  },
  lockedContentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedContentSubtitle: {
    fontSize: 15,
    color: Colors.grey3,
    textAlign: 'center',
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

export default CardScreen;
