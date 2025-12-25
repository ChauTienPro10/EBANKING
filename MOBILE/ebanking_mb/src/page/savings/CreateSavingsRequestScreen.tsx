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
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import Header from '../../components/Header';
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
        <Header title={getTitle()} showBackButton />
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
        <Header title={getTitle()} showBackButton />
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
      <Header title={getTitle()} showBackButton />

      <ScrollView style={styles.content}>
        {/* Mô tả */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>
        </View>

        {/* Thông tin tài khoản */}
        <View style={styles.accountContainer}>
          <Text style={styles.sectionTitle}>Tài khoản tiết kiệm</Text>

          <View style={styles.accountCard}>
            <Text style={styles.accountName}>
              {account.accountName ||
                `Tài khoản tiết kiệm ${account.termMonths} tháng`}
            </Text>
            <Text style={styles.accountNumber}>
              STK: {account.accountNumber}
            </Text>
            <Text style={styles.accountBalance}>
              Số dư: {formatCurrency(account.balance)}
            </Text>
            <Text style={styles.accountRate}>
              Lãi suất: {(account.interestRate * 100).toFixed(2)}%/năm
            </Text>
          </View>
        </View>

        {/* Nhập số tiền */}
        <View style={styles.amountContainer}>
          <Text style={styles.sectionTitle}>Số tiền</Text>
          <TextInput
            style={styles.amountInput}
            value={amount ? formatCurrency(parseCurrency(amount)) : ''}
            onChangeText={handleAmountChange}
            placeholder="Nhập số tiền"
            keyboardType="numeric"
          />

          {type === 'WITHDRAW' && (
            <Text style={styles.maxAmountText}>
              Số dư khả dụng: {formatCurrency(account.balance)}
            </Text>
          )}

          <View style={styles.amountHints}>
            <Text style={styles.hintTitle}>Lưu ý:</Text>
            <Text style={styles.hintText}>• Số tiền tối thiểu: 100,000 ₫</Text>
            <Text style={styles.hintText}>
              • Số tiền tối đa mỗi lần: 500,000,000 ₫
            </Text>
            <Text style={styles.hintText}>• Phí xử lý: Miễn phí</Text>
          </View>
        </View>

        {/* Ghi chú */}
        <View style={styles.noteContainer}>
          <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú cho yêu cầu"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{note.length}/500</Text>
        </View>

        {/* Thông tin xử lý */}
        <View style={styles.processingInfoContainer}>
          <Text style={styles.sectionTitle}>Thông tin xử lý</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian xử lý:</Text>
              <Text style={styles.infoValue}>1-2 ngày làm việc</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phí xử lý:</Text>
              <Text style={styles.infoValue}>Miễn phí</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text style={styles.infoValue}>Chờ duyệt sau khi tạo</Text>
            </View>
          </View>

          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Yêu cầu không thể chỉnh sửa sau khi tạo. Vui lòng kiểm tra kỹ
              thông tin trước khi xác nhận.
            </Text>
          </View>
        </View>

        {/* Tóm tắt yêu cầu */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Tóm tắt yêu cầu</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Loại yêu cầu:</Text>
              <Text style={styles.summaryValue}>
                {type === 'DEPOSIT' ? 'Nạp tiền mặt' : 'Rút tiền mặt'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tài khoản:</Text>
              <Text style={styles.summaryValue}>{account.accountNumber}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số tiền:</Text>
              <Text style={[styles.summaryValue, styles.amountValue]}>
                {amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'}
              </Text>
            </View>

            {note.trim() && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ghi chú:</Text>
                <Text style={styles.summaryValue}>{note.trim()}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Nút tạo yêu cầu */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, creating && styles.disabledButton]}
          onPress={handleCreateRequest}
          disabled={creating || !amount}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Tạo yêu cầu</Text>
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  accountContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  accountRate: {
    fontSize: 14,
    color: '#666666',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  maxAmountText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  amountHints: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 4,
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  processingInfoContainer: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#1976D2',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  createButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
