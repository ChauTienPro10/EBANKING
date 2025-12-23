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
import { RootStackParamList } from '../../navigation/types';
import { RootState, AppDispatch } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';
import Header from '../../components/Header';
import ConfirmModal from '../../components/ConfirmModal';
import PinInputModal from '../../components/PinInputModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<RootStackParamList, 'SavingsTransfer'>;

export default function SavingsTransferScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { accountNumber, type } = route.params;
  const { userInfoData: userInfo, accountTransResponse, loginResponse } = useSelector((state: RootState) => state.app);
  
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFullWithdrawalWarning, setShowFullWithdrawalWarning] = useState(false);

  useEffect(() => {
    loadAccountDetail();
  }, []);

  const loadAccountDetail = async () => {
    try {
      const accountData = await SavingsService.getSavingsAccountDetail(accountNumber);
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

    if (type === 'FROM_SAVINGS' && account && transferAmount > account.balance) {
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
    if (!validateTransfer() || !account || !accountTransResponse?.accountNumber) return;
    
    // Check if this is a full withdrawal from savings
    const transferAmount = parseCurrency(amount);
    if (type === 'FROM_SAVINGS' && account && transferAmount === account.balance) {
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
    if (!account || !accountTransResponse?.accountNumber || !userInfo?.id || !loginResponse?.username) return;

    setTransferring(true);
    try {
      const transferData = {
        fromAccount: type === 'TO_SAVINGS' ? accountTransResponse.accountNumber : account.accountNumber,
        toAccount: type === 'TO_SAVINGS' ? account.accountNumber : accountTransResponse.accountNumber,
        amount: parseCurrency(amount),
        type,
        note: note.trim() || undefined,
      };

      if (type === 'TO_SAVINGS') {
        await SavingsService.transferToSavings(transferData, userInfo.id, loginResponse.username);
      } else {
        await SavingsService.transferFromSavings(transferData, userInfo.id, loginResponse.username);
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
    return type === 'TO_SAVINGS' ? 'Nạp vào tiết kiệm' : 'Rút từ tiết kiệm';
  };

  const getDescription = () => {
    return type === 'TO_SAVINGS' 
      ? 'Chuyển tiền từ tài khoản giao dịch vào tài khoản tiết kiệm'
      : 'Chuyển tiền từ tài khoản tiết kiệm về tài khoản giao dịch';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={getTitle()} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
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
          <Text style={styles.errorText}>Không tìm thấy thông tin tài khoản</Text>
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
          <Text style={styles.description}>{getDescription()}</Text>
        </View>

        {/* Thông tin tài khoản */}
        <View style={styles.accountInfoContainer}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          
          <View style={styles.accountCard}>
            <Text style={styles.accountName}>
              {account.accountName || `Tài khoản tiết kiệm ${account.termMonths} tháng`}
            </Text>
            <Text style={styles.accountNumber}>STK: {account.accountNumber}</Text>
            <Text style={styles.accountBalance}>
              Số dư: {formatCurrency(account.balance)}
            </Text>
          </View>

          <View style={styles.linkedAccountCard}>
            <Text style={styles.linkedAccountTitle}>Tài khoản giao dịch</Text>
            <Text style={styles.linkedAccountNumber}>
              {accountTransResponse?.accountNumber || 'Chưa có tài khoản'}
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
          
          {type === 'FROM_SAVINGS' && account && (
            <>
              <Text style={styles.maxAmountText}>
                Số dư khả dụng: {formatCurrency(account.balance)}
              </Text>
              <TouchableOpacity
                style={styles.withdrawAllButton}
                onPress={() => setAmount(account.balance.toString())}
              >
                <Text style={styles.withdrawAllText}>Rút tất cả</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Ghi chú */}
        <View style={styles.noteContainer}>
          <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú cho giao dịch"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Thông tin giao dịch */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Thông tin giao dịch</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Từ tài khoản:</Text>
            <Text style={styles.summaryValue}>
              {type === 'TO_SAVINGS' ? accountTransResponse?.accountNumber : account.accountNumber}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đến tài khoản:</Text>
            <Text style={styles.summaryValue}>
              {type === 'TO_SAVINGS' ? account.accountNumber : accountTransResponse?.accountNumber}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền:</Text>
            <Text style={[styles.summaryValue, styles.amountValue]}>
              {amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'}
            </Text>
          </View>
        </View>
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
            <Text style={styles.transferButtonText}>Xác nhận giao dịch</Text>
          )}
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận giao dịch"
        message={`Bạn có chắc chắn muốn ${type === 'TO_SAVINGS' ? 'chuyển' : 'rút'} ${amount ? formatCurrency(parseCurrency(amount)) : '0 ₫'} ${type === 'TO_SAVINGS' ? 'vào' : 'từ'} tài khoản tiết kiệm?`}
        onConfirm={handleConfirmTransfer}
        onCancel={() => setShowConfirmModal(false)}
      />

      <PinInputModal
        visible={showPinModal}
        title="Nhập mã PIN"
        message={`Vui lòng nhập mã PIN để xác nhận ${type === 'TO_SAVINGS' ? 'chuyển tiền vào' : 'rút tiền từ'} tài khoản tiết kiệm`}
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
        message={`Bạn đang rút toàn bộ số dư ${formatCurrency(account?.balance || 0)} từ tài khoản tiết kiệm.\n\nViệc này sẽ dẫn đến TẤT TOÁN tài khoản tiết kiệm và tài khoản sẽ bị HỦY vĩnh viễn.\n\nBạn có chắc chắn muốn tiếp tục?`}
        confirmText="Tất toán"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmFullWithdrawal}
        onCancel={() => setShowFullWithdrawalWarning(false)}
        confirmButtonStyle={{ backgroundColor: '#F44336' }} // Red color for warning
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
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  accountInfoContainer: {
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
    marginBottom: 12,
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
  },
  linkedAccountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  linkedAccountTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  linkedAccountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
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
  },
  maxAmountText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
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
  },
  summaryContainer: {
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
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
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
  transferButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawAllButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 8,
  },
  withdrawAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});