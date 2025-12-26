import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { RootState, AppDispatch } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';
import { useEkycValidation } from '../../utils/useEkycValidation';
import ConfirmModal from '../../components/ConfirmModal';
import PinInputModal from '../../components/PinInputModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<RootStackParamList, 'SavingsTransfer'>;

export default function SavingsTransferScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { accountNumber, type } = route.params;
  const {
    userInfoData: userInfo,
    accountTransResponse,
    loginResponse,
  } = useSelector((state: RootState) => state.app);
  const { validateEkyc } = useEkycValidation();

  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFullWithdrawalWarning, setShowFullWithdrawalWarning] =
    useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadAccountDetail();
  }, []);

  const loadAccountDetail = async () => {
    try {
      const accountData = await SavingsService.getSavingsAccountDetail(
        accountNumber,
      );
      setAccount(accountData);
    } catch (error) {
      console.error('Error loading account detail:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải thông tin tài khoản',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const parseCurrency = (text: string) => {
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  };

  const handleAmountChange = (text: string) => {
    const numericValue = parseCurrency(text);
    setAmount(numericValue.toString());
  };

  const validateTransfer = () => {
    const transferAmount = parseCurrency(amount);

    if (transferAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập số tiền hợp lệ',
      });
      return false;
    }

    if (
      type === 'FROM_SAVINGS' &&
      account &&
      transferAmount > account.balance
    ) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Số dư tài khoản tiết kiệm không đủ',
      });
      return false;
    }

    // Có thể thêm các validation khác như số dư tài khoản giao dịch

    return true;
  };

  const handleTransfer = () => {
    if (!validateTransfer() || !account || !accountTransResponse?.accountNumber)
      return;

    const transferAmount = parseCurrency(amount);

    // Check eKYC for high-value transactions (> 10M VND)
    if (transferAmount > 10000000) {
      const ekycValidation = validateEkyc(
        (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
          setShowEKYCModal(true);
        },
      );

      if (!ekycValidation.isValid) {
        return;
      }
    }

    // Check if this is a full withdrawal from savings
    if (
      type === 'FROM_SAVINGS' &&
      account &&
      transferAmount === account.balance
    ) {
      setShowFullWithdrawalWarning(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmFullWithdrawal = () => {
    setShowFullWithdrawalWarning(false);
    setShowConfirmModal(true);
  };

  const handleConfirmTransfer = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const performTransfer = async () => {
    if (
      !account ||
      !accountTransResponse?.accountNumber ||
      !userInfo?.id ||
      !loginResponse?.username
    )
      return;

    setTransferring(true);
    try {
      const transferData = {
        fromAccount:
          type === 'TO_SAVINGS'
            ? accountTransResponse.accountNumber
            : account.accountNumber,
        toAccount:
          type === 'TO_SAVINGS'
            ? account.accountNumber
            : accountTransResponse.accountNumber,
        amount: parseCurrency(amount),
        type,
        note: note.trim() || undefined,
      };

      if (type === 'TO_SAVINGS') {
        await SavingsService.transferToSavings(
          transferData,
          userInfo.id,
          loginResponse.username,
        );
      } else {
        await SavingsService.transferFromSavings(
          transferData,
          userInfo.id,
          loginResponse.username,
        );
      }

      // Fetch lại thông tin tài khoản thanh toán để cập nhật số dư
      await dispatch(fetchAccountTransInfo(userInfo.id));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Giao dịch đã được thực hiện thành công',
      });

      // Delay để user thấy toast message trước khi navigate
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error performing transfer:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thực hiện giao dịch',
      });
    } finally {
      setTransferring(false);
    }
  };

  const getTitle = () => {
    return type === 'TO_SAVINGS'
      ? t('savings.deposit_to_savings')
      : t('savings.withdraw_from_savings');
  };

  const getDescription = () => {
    return type === 'TO_SAVINGS'
      ? t('savings.transfer_to_savings_description')
      : t('savings.transfer_from_savings_description');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09a0a5" />
          <Text style={styles.loadingText}>{t('savings.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('savings.error_account_not_found')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons
            name={
              type === 'TO_SAVINGS' ? 'arrow-down-circle' : 'arrow-up-circle'
            }
            size={20}
            color="#1E40AF"
          />
          <Text style={styles.infoBannerText}>{getDescription()}</Text>
        </View>

        {/* Transfer Flow Visualization */}
        <View style={styles.transferFlow}>
          {/* From Account */}
          <View style={styles.flowCard}>
            <View style={styles.flowHeader}>
              <Ionicons
                name={type === 'TO_SAVINGS' ? 'wallet' : 'piggy-bank'}
                size={20}
                color="#6B7280"
              />
              <Text style={styles.flowLabel}>{t('savings.from_account')}</Text>
            </View>
            <Text style={styles.flowAccountNumber}>
              {type === 'TO_SAVINGS'
                ? accountTransResponse?.accountNumber
                : account.accountNumber}
            </Text>
            <Text style={styles.flowAccountType}>
              {type === 'TO_SAVINGS'
                ? t('savings.payment_account')
                : t('savings.savings_account')}
            </Text>
            {type === 'FROM_SAVINGS' && (
              <Text style={styles.flowBalance}>
                {t('savings.balance')}: {formatCurrency(account.balance)}
              </Text>
            )}
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-down" size={24} color="#09a0a5" />
          </View>

          {/* To Account */}
          <View style={styles.flowCard}>
            <View style={styles.flowHeader}>
              <Ionicons
                name={type === 'TO_SAVINGS' ? 'piggy-bank' : 'wallet'}
                size={20}
                color="#6B7280"
              />
              <Text style={styles.flowLabel}>{t('savings.to_account')}</Text>
            </View>
            <Text style={styles.flowAccountNumber}>
              {type === 'TO_SAVINGS'
                ? account.accountNumber
                : accountTransResponse?.accountNumber}
            </Text>
            <Text style={styles.flowAccountType}>
              {type === 'TO_SAVINGS'
                ? t('savings.savings_account')
                : t('savings.payment_account')}
            </Text>
          </View>
        </View>

        {/* Amount Input Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>{t('savings.transfer_amount')}</Text>
          </View>

          <TextInput
            style={styles.amountInput}
            value={amount ? formatCurrency(parseCurrency(amount)) : ''}
            onChangeText={handleAmountChange}
            placeholder="0 ₫"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />

          {type === 'FROM_SAVINGS' && account && (
            <Text style={styles.availableBalance}>
              {t('savings.available')}: {formatCurrency(account.balance)}
            </Text>
          )}

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {[1000000, 5000000, 10000000].map(quickAmount => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>
                  {formatCurrency(quickAmount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Max Button */}
          {type === 'FROM_SAVINGS' && account && (
            <TouchableOpacity
              style={styles.maxButton}
              onPress={() => setAmount(account.balance.toString())}
            >
              <Text style={styles.maxButtonText}>{t('savings.max')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Note Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create-outline" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.optionalBadge}>Tùy chọn</Text>
          </View>

          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t('savings.add_transfer_note_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {t('savings.transaction_summary')}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('savings.transaction_type')}
            </Text>
            <Text style={styles.summaryValue}>
              {type === 'TO_SAVINGS'
                ? t('savings.deposit_to_savings')
                : t('savings.withdraw_from_savings')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('savings.amount')}</Text>
            <Text style={styles.summaryAmount}>
              {amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao dịch</Text>
            <Text style={styles.summaryValue}>Miễn phí</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Nút xác nhận */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.transferButton, transferring && styles.disabledButton]}
          onPress={handleTransfer}
          disabled={transferring || !amount}
        >
          {transferring ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.transferButtonText}>
              {t('savings.confirm_transaction')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận giao dịch"
        message={`Bạn có chắc chắn muốn ${
          type === 'TO_SAVINGS' ? 'chuyển' : 'rút'
        } ${amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'} ${
          type === 'TO_SAVINGS' ? 'vào' : 'từ'
        } tài khoản tiết kiệm?`}
        onConfirm={handleConfirmTransfer}
        onCancel={() => setShowConfirmModal(false)}
      />

      <PinInputModal
        visible={showPinModal}
        title="Nhập mã PIN"
        message={`Vui lòng nhập mã PIN để xác nhận ${
          type === 'TO_SAVINGS' ? 'chuyển tiền vào' : 'rút tiền từ'
        } tài khoản tiết kiệm`}
        onConfirm={() => {
          setShowPinModal(false);
          performTransfer();
        }}
        onCancel={() => setShowPinModal(false)}
        loading={transferring}
      />

      {/* Full Withdrawal Warning Modal */}
      <ConfirmModal
        visible={showFullWithdrawalWarning}
        title="⚠️ Cảnh báo tất toán"
        message={`Bạn đang rút toàn bộ số dư ${formatCurrency(
          account?.balance || 0,
        )} từ tài khoản tiết kiệm.\n\nViệc này sẽ dẫn đến TẤT TOÁN tài khoản tiết kiệm và tài khoản sẽ bị HỦY vĩnh viễn.\n\nBạn có chắc chắn muốn tiếp tục?`}
        confirmText="Tất toán"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmFullWithdrawal}
        onCancel={() => setShowFullWithdrawalWarning(false)}
        confirmButtonStyle={{ backgroundColor: '#F44336' }} // Red color for warning
      />

      {/* eKYC Modal */}
      <ConfirmModal
        visible={showEKYCModal}
        title="⚠️ Yêu cầu xác thực eKYC"
        message="Giao dịch có giá trị lớn yêu cầu xác thực eKYC. Vui lòng hoàn thành xác thực để tiếp tục."
        confirmText="Xác thực ngay"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          setShowEKYCModal(false);
          navigation.navigate('EKYC');
        }}
        onCancel={() => setShowEKYCModal(false)}
        confirmButtonStyle={{ backgroundColor: '#1976D2' }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: { width: 40 },
  content: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: { marginTop: 16, fontSize: 15, color: '#6B7280' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: { fontSize: 15, color: '#6B7280' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 10,
  },
  infoBannerText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  transferFlow: { marginHorizontal: 16, marginBottom: 12 },
  flowCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  flowLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  flowAccountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  flowAccountType: { fontSize: 13, color: '#6B7280' },
  flowBalance: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 6,
  },
  arrowContainer: { alignItems: 'center', paddingVertical: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#09a0a5',
    marginBottom: 12,
  },
  availableBalance: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAmountButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickAmountText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  maxButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  maxButtonText: { color: '#92400E', fontWeight: '600', fontSize: 14 },
  noteInput: {
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#09a0a5',
    textAlign: 'right',
  },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  transferButton: {
    backgroundColor: '#09a0a5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#09a0a5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  transferButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
