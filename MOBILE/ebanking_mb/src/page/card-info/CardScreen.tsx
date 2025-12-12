import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCardStatus } from '../../store/slices/appSlice';
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
import {
  mockCardData,
  mockTransactions,
  filterTransactions,
} from './mockCardData';
import MenuDotsIcon from '../../components/icon/MenuDotsIcon';
import LockOpenIcon from '../../components/icon/LockOpenIcon';
import LockIcon from '../../components/icon/LockIcon';
import InfoCircleIcon from '../../components/icon/InfoCircleIcon';
import PinInput from '../../components/PinInput';
import Toast from 'react-native-toast-message';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import ReminderPopup from '../../popups/ReminderPopupProps';

type FilterType = 'all' | 'sent' | 'received';
type PendingAction = 'lock' | 'unlock' | 'access' | null;

const CardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get card status from Redux store
  const cardStatus = useSelector((state: RootState) => state.app.cardStatus);
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );

  const userInfo = useSelector((state: RootState) => state.app.userInfoData);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [requireSetPin, setRequireSetPin] = useState(false);
  const loginResponse = useSelector((state: RootState) => state.app.loginResponse);

  // Custom hooks
  const { isCardNumberVisible, toggleCardNumberVisibility, copyCardNumber } =
    useCardActions();
  const { activeTab, handleBackPress, handleTabChange, handleQRPress } =
    useCardNavigation();

  React.useEffect(() => {
    if (loginResponse?.pinStatus !== true) {
      setRequireSetPin(true);
    } else {
      setRequireSetPin(false);
    }
  }, [loginResponse]);

  // Card data
  // const fullCardNumber = '1237689076545678';
  // const maskedCardNumber = '1237 •••• •••• 5678';
  // const displayCardNumber = '1237 6890 7654 5678';

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")              // bỏ ký tự không phải số
      .replace(/(.{4})/g, "$1 ")       // chèn khoảng trắng sau mỗi 4 số
      .trim();                         // bỏ khoảng trắng cuối nếu có
  };

  const maskCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, ""); // bỏ hết ký tự không phải số

    if (digits.length < 12) return value; // không đủ số thì giữ nguyên

    const first4 = digits.slice(0, 4);
    const last4 = digits.slice(-4);

    return `${first4} **** **** ${last4}`;
  };

  const filteredTransactions = filterTransactions(
    mockTransactions,
    activeFilter,
  );

  const openPinModal = useCallback((action: PendingAction) => {
    setPendingAction(action);
    setIsVerifyingPin(false);
    setPinInputKey((prev) => prev + 1);
    setShowPinModal(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsAccessGranted(false);
      setShowMenu(false);
      if (loginResponse?.pinStatus === true) {
        openPinModal('access');
      }
    }, [openPinModal, loginResponse]),
  );

  const handlePinComplete = async (pin: string) => {
    if (isVerifyingPin) {
      return;
    }

    if (!loginResponse?.username) {
      Toast.show({
        type: 'error',
        text1: 'Không tìm thấy người dùng',
        text2: 'Vui lòng đăng nhập lại',
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
        text1: 'Sai mã PIN',
        text2: message,
      });

      setPinInputKey((prev) => prev + 1);
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
        return 'Xác nhận khóa thẻ';
      case 'unlock':
        return 'Xác nhận mở khóa thẻ';
      case 'access':
        return 'Xác thực mã PIN';
      default:
        return '';
    }
  };

  const pinModalSubtitle = () => {
    if (isVerifyingPin) {
      return 'Đang xác thực mã PIN...';
    }

    switch (pendingAction) {
      case 'access':
        return 'Nhập mã PIN của bạn để xem thông tin thẻ';
      default:
        return 'Nhập mã PIN của bạn để tiếp tục';
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
                {cardStatus === 'active' ? 'Khóa thẻ' : 'Mở khóa thẻ'}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShowDetail}
            >
              <InfoCircleIcon size={20} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Chi tiết thẻ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAccessGranted ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <CreditCard
            bankName=".Pay"
            cardNumber={formatCardNumber(account?.accountNumber ?? '')}
            isNumberVisible={isCardNumberVisible}
            maskedNumber={maskCardNumber(account?.accountNumber ?? '')}
            holderName={userInfo?.fullName}
            expiryMonth={mockCardData.expiryMonth}
            expiryYear={mockCardData.expiryYear}
            onNumberPress={toggleCardNumberVisibility}
            onNumberLongPress={() => copyCardNumber(formatCardNumber(account?.accountNumber ?? ''))}
            isLocked={cardStatus === 'locked'}
          />

          <CardBalanceSection
            balance={account?.balance ?? mockCardData.balance}
            currency={account?.currency ?? mockCardData.currency}
            accountNumber={account?.accountNumber ?? null}
          />

          <CardLimitSection
            spentAmount={mockCardData.spentAmount}
            cardLimit={mockCardData.cardLimit}
          />

          <TransactionList
            transactions={filteredTransactions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </ScrollView>
      ) : (
        <View style={styles.lockedContent}>
          <Text style={styles.lockedContentTitle}>Thông tin được bảo vệ</Text>
          <Text style={styles.lockedContentSubtitle}>
            Vui lòng xác thực mã PIN để xem chi tiết thẻ của bạn
          </Text>
        </View>
      )}

      <ReminderPopup
        visible={requireSetPin}
        message={t('home.pin_not_set_message')}
        confirmLabel={t('common.set_pin_now')}
        onClose={() => {
          setRequireSetPin(false);
          handleTabChange('settings');
        }}
      />
      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
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
              <Text style={styles.pinModalCancelText}>Hủy</Text>
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

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>
              {pendingAction === 'lock'
                ? 'Xác nhận khóa thẻ'
                : 'Xác nhận mở khóa thẻ'}
            </Text>
            <Text style={styles.pinModalSubtitle}>
              Nhập mã PIN của bạn để tiếp tục
            </Text>
            <PinInput
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
              <Text style={styles.pinModalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Card Detail Bottom Sheet */}
      <CardDetailBottomSheet
        visible={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
      />

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
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
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
