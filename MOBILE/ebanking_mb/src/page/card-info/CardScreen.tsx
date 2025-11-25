import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCardStatus } from '../../store/slices/appSlice';
import Colors from '../../constants/color';
import BottomNavigation from '../../components/BottomNavigation';
import Header from '../../components/Header';
import { CreditCard, CardLimitSection, TransactionList } from './components';
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

type FilterType = 'all' | 'sent' | 'received';

const CardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get card status from Redux store
  const cardStatus = useSelector((state: RootState) => state.app.cardStatus);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<'lock' | 'unlock' | null>(
    null,
  );

  // Custom hooks
  const { isCardNumberVisible, toggleCardNumberVisibility, copyCardNumber } =
    useCardActions();
  const { activeTab, handleBackPress, handleTabChange, handleQRPress } =
    useCardNavigation();

  // Card data
  const fullCardNumber = '1237689076545678';
  const maskedCardNumber = '1237 •••• •••• 5678';
  const displayCardNumber = '1237 6890 7654 5678';

  const filteredTransactions = filterTransactions(
    mockTransactions,
    activeFilter,
  );

  const handlePinComplete = (pin: string) => {
    // Verify PIN (mock implementation)
    if (pin === '1111') {
      if (pendingAction === 'lock') {
        dispatch(setCardStatus('locked'));
        Toast.show({
          type: 'success',
          text1: 'Thẻ đã bị khóa',
          text2: 'Thẻ của bạn đã được khóa thành công',
        });
      } else if (pendingAction === 'unlock') {
        dispatch(setCardStatus('active'));
        Toast.show({
          type: 'success',
          text1: 'Thẻ đã được mở khóa',
          text2: 'Thẻ của bạn đã được kích hoạt trở lại',
        });
      }
      setShowPinModal(false);
      setShowMenu(false);
      setPendingAction(null);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Sai mã PIN',
        text2: 'Vui lòng thử lại',
      });
    }
  };

  const handleLockToggle = () => {
    setPendingAction(cardStatus === 'active' ? 'lock' : 'unlock');
    setShowPinModal(true);
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <CreditCard
          bankName=".Pay"
          cardNumber={displayCardNumber}
          isNumberVisible={isCardNumberVisible}
          maskedNumber={maskedCardNumber}
          holderName="Lê Tất Thắng"
          expiryMonth={mockCardData.expiryMonth}
          expiryYear={mockCardData.expiryYear}
          onNumberPress={toggleCardNumberVisibility}
          onNumberLongPress={() => copyCardNumber(fullCardNumber)}
          isLocked={cardStatus === 'locked'}
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
        cardData={{
          cardNumber: '1237 6890 7654 5678',
          cardHolderName: mockCardData.cardHolderName,
          expiryMonth: mockCardData.expiryMonth,
          expiryYear: mockCardData.expiryYear,
          cvv: mockCardData.cvv,
          cardType: mockCardData.cardType,
          issueDate: mockCardData.issueDate,
          cardLimit: mockCardData.cardLimit,
          availableBalance: mockCardData.cardLimit - mockCardData.spentAmount,
        }}
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
