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
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import ConfirmModal from '../../components/ConfirmModal';
import PinInputModal from '../../components/PinInputModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<
  RootStackParamList,
  'CreateSavingsRequest'
>;

export default function CreateSavingsRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { accountNumber, type } = route.params;
  const { userInfoData: userInfo, loginResponse } = useSelector(
    (state: RootState) => state.app,
  );

  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

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

  const validateRequest = () => {
    const requestAmount = parseCurrency(amount);

    if (requestAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập số tiền hợp lệ',
      });
      return false;
    }

    if (type === 'WITHDRAW' && account && requestAmount > account.balance) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Số dư tài khoản tiết kiệm không đủ',
      });
      return false;
    }

    // Validation số tiền tối thiểu/tối đa
    const MIN_AMOUNT = 100000; // 100,000 VND
    const MAX_AMOUNT = 500000000; // 500,000,000 VND

    if (requestAmount < MIN_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Số tiền tối thiểu là ${formatCurrency(MIN_AMOUNT)}`,
      });
      return false;
    }

    if (requestAmount > MAX_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Số tiền tối đa là ${formatCurrency(MAX_AMOUNT)}`,
      });
      return false;
    }

    return true;
  };

  const handleCreateRequest = () => {
    if (!validateRequest()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmRequest = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const performCreateRequest = async () => {
    if (!account || !userInfo?.id || !loginResponse?.username) return;

    setCreating(true);
    try {
      await SavingsService.createSavingsRequest(
        {
          savingsAccountId: account.id,
          type,
          amount: parseCurrency(amount),
          note: note.trim() || undefined,
        },
        userInfo.id,
        loginResponse.username,
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Yêu cầu đã được tạo thành công và đang chờ xử lý',
      });

      // Delay để user thấy toast message trước khi navigate
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error creating request:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo yêu cầu',
      });
    } finally {
      setCreating(false);
    }
  };

  const getTitle = () => {
    return type === 'DEPOSIT' ? 'Yêu cầu nạp tiền mặt' : 'Yêu cầu rút tiền mặt';
  };

  const getDescription = () => {
    return type === 'DEPOSIT'
      ? 'Tạo yêu cầu nạp tiền mặt vào tài khoản tiết kiệm. Yêu cầu sẽ được xử lý trong vòng 1-2 ngày làm việc.'
      : 'Tạo yêu cầu rút tiền mặt từ tài khoản tiết kiệm. Yêu cầu sẽ được xử lý trong vòng 1-2 ngày làm việc.';
  };

  const getIcon = () => {
    return type === 'DEPOSIT' ? '💰' : '💸';
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
          <Text style={styles.loadingText}>Đang tải...</Text>
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
            Không tìm thấy thông tin tài khoản
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
          <View style={styles.infoBannerIcon}>
            <Text style={styles.infoBannerEmoji}>{getIcon()}</Text>
          </View>
          <Text style={styles.infoBannerText}>{getDescription()}</Text>
        </View>

        {/* Account Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Tài khoản tiết kiệm</Text>
          </View>

          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {account.accountName || `Tiết kiệm ${account.termMonths} tháng`}
            </Text>
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>

            <View style={styles.accountDetails}>
              <View style={styles.accountDetailItem}>
                <Text style={styles.accountDetailLabel}>Số dư</Text>
                <Text style={styles.accountDetailValue}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>
              <View style={styles.accountDetailDivider} />
              <View style={styles.accountDetailItem}>
                <Text style={styles.accountDetailLabel}>Lãi suất</Text>
                <Text style={styles.accountDetailValue}>
                  {(account.interestRate * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Amount Input Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Số tiền</Text>
          </View>

          <TextInput
            style={styles.amountInput}
            value={amount ? formatCurrency(parseCurrency(amount)) : ''}
            onChangeText={handleAmountChange}
            placeholder="0 ₫"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />

          {type === 'WITHDRAW' && (
            <Text style={styles.availableBalance}>
              Khả dụng: {formatCurrency(account.balance)}
            </Text>
          )}

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
            placeholder="Thêm ghi chú cho yêu cầu này..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{note.length}/500</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt giao dịch</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loại giao dịch</Text>
            <Text style={styles.summaryValue}>
              {type === 'DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền</Text>
            <Text style={styles.summaryAmount}>
              {amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao dịch</Text>
            <Text style={styles.summaryValue}>Miễn phí</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thời gian xử lý</Text>
            <Text style={styles.summaryValue}>1-2 ngày</Text>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={16} color="#6B7280" />
          <Text style={styles.infoNoteText}>
            Yêu cầu không thể chỉnh sửa sau khi tạo. Vui lòng kiểm tra kỹ thông
            tin.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!amount || creating) && styles.submitButtonDisabled,
          ]}
          onPress={handleCreateRequest}
          disabled={creating || !amount}
          activeOpacity={0.8}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Xác nhận giao dịch</Text>
          )}
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận yêu cầu"
        message={`Bạn có chắc chắn muốn tạo yêu cầu ${
          type === 'DEPOSIT' ? 'nạp' : 'rút'
        } ${amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'} tiền mặt?`}
        onConfirm={handleConfirmRequest}
        onCancel={() => setShowConfirmModal(false)}
      />

      <PinInputModal
        visible={showPinModal}
        title="Nhập mã PIN"
        message={`Vui lòng nhập mã PIN để xác nhận tạo yêu cầu ${
          type === 'DEPOSIT' ? 'nạp' : 'rút'
        } tiền mặt`}
        onConfirm={() => {
          setShowPinModal(false);
          performCreateRequest();
        }}
        onCancel={() => setShowPinModal(false)}
        loading={creating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header Styles
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBannerEmoji: {
    fontSize: 20,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },

  // Card Styles
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
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

  // Account Info
  accountInfo: {
    gap: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  accountDetails: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  accountDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  accountDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  accountDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  accountDetailDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },

  // Amount Input
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

  // Quick Amounts
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  // Note Input
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
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },

  // Summary Card
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
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
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
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 8,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },

  // Bottom Button
  bottomContainer: {
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
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
