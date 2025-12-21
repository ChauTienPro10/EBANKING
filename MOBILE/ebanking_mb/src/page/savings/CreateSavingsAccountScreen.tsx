import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import { RootState, AppDispatch } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsTermType } from '../../types/SavingsTypes';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';
import Header from '../../components/Header';
import ConfirmModal from '../../components/ConfirmModal';
import PinInputModal from '../../components/PinInputModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateSavingsAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector((state: RootState) => state.app);
  
  const [selectedTerm, setSelectedTerm] = useState<SavingsTermType | null>(null);
  const [initialAmount, setInitialAmount] = useState('');
  const [terms, setTerms] = useState<SavingsTermType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const termsData = await SavingsService.getInterestRates();
      setTerms(termsData);
    } catch (error) {
      console.error('Error loading interest rates:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách lãi suất',
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
    setInitialAmount(numericValue.toString());
  };

  const validateForm = () => {
    if (!userInfo?.id) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy thông tin người dùng',
      });
      return false;
    }

    if (!accountTransResponse?.accountId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy tài khoản thanh toán',
      });
      return false;
    }

    if (!selectedTerm) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn kỳ hạn gửi tiết kiệm',
      });
      return false;
    }

    const amount = parseCurrency(initialAmount);
    if (amount < selectedTerm.minAmount) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Số tiền gửi tối thiểu là ${formatCurrency(selectedTerm.minAmount)}`,
      });
      return false;
    }

    if (amount > selectedTerm.maxAmount) {
      // Only show max amount error if there's actually a limit
      if (selectedTerm.maxAmount !== Number.MAX_SAFE_INTEGER) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: `Số tiền gửi tối đa là ${formatCurrency(selectedTerm.maxAmount)}`,
        });
        return false;
      }
    }

    return true;
  };

  const handleCreateAccount = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const performCreateAccount = async () => {
    if (!accountTransResponse?.accountId || !userInfo?.id) return;

    setCreating(true);
    try {
      await SavingsService.createSavingsAccount({
        userId: userInfo.id,
        paymentAccountId: accountTransResponse.accountId,
        initialAmount: parseCurrency(initialAmount),
        currency: 'VND',
        interestRateId: selectedTerm!.interestRateId,
        termMonths: selectedTerm!.termMonths,
      });

      // Fetch lại thông tin tài khoản thanh toán để cập nhật số dư
      await dispatch(fetchAccountTransInfo(userInfo.id));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Tài khoản tiết kiệm đã được tạo thành công',
      });

      // Delay để user thấy toast message trước khi navigate
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error creating savings account:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo tài khoản tiết kiệm',
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Mở tài khoản tiết kiệm" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mở tài khoản tiết kiệm" showBackButton />
      
      <ScrollView style={styles.content}>
        {/* Thông tin người dùng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người dùng</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{userInfo?.fullName || 'Chưa có thông tin'}</Text>
          </View>
        </View>

        {/* Chọn kỳ hạn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn kỳ hạn gửi tiết kiệm</Text>
          {terms.map((term) => (
            <TouchableOpacity
              key={term.interestRateId}
              style={[
                styles.termCard,
                selectedTerm?.interestRateId === term.interestRateId && styles.selectedTermCard,
              ]}
              onPress={() => setSelectedTerm(term)}
            >
              <View style={styles.termHeader}>
                <Text style={styles.termName}>{term.name}</Text>
                <Text style={styles.termRate}>{term.annualRate}%/năm</Text>
              </View>
              <Text style={styles.termDuration}>{term.termMonths} tháng</Text>
              <Text style={styles.termAmount}>
                Số tiền: {formatCurrency(term.minAmount)} - {
                  term.maxAmount === Number.MAX_SAFE_INTEGER 
                    ? 'Không giới hạn' 
                    : formatCurrency(term.maxAmount)
                }
              </Text>
              <Text style={styles.termDescription}>{term.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Số tiền gửi ban đầu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số tiền gửi ban đầu</Text>
          <TextInput
            style={styles.input}
            value={initialAmount ? formatCurrency(parseCurrency(initialAmount)) : ''}
            onChangeText={handleAmountChange}
            placeholder="Nhập số tiền"
            keyboardType="numeric"
          />
          {selectedTerm && (
            <Text style={styles.amountHint}>
              Tối thiểu: {formatCurrency(selectedTerm.minAmount)} - 
              Tối đa: {
                selectedTerm.maxAmount === Number.MAX_SAFE_INTEGER 
                  ? 'Không giới hạn' 
                  : formatCurrency(selectedTerm.maxAmount)
              }
            </Text>
          )}
        </View>

        {/* Thông tin tài khoản thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản thanh toán</Text>
          <View style={styles.linkedAccountCard}>
            <Text style={styles.linkedAccountText}>
              {accountTransResponse?.accountNumber || 'Chưa có tài khoản thanh toán'}
            </Text>
            <Text style={styles.linkedAccountSubText}>
              Loại: {accountTransResponse?.accountType || 'N/A'}
            </Text>
            <Text style={styles.linkedAccountSubText}>
              Số dư: {accountTransResponse ? formatCurrency(accountTransResponse.balance) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Thông tin giao dịch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao dịch</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Người gửi:</Text>
              <Text style={styles.summaryValue}>{userInfo?.fullName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tài khoản nguồn:</Text>
              <Text style={styles.summaryValue}>{accountTransResponse?.accountNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kỳ hạn:</Text>
              <Text style={styles.summaryValue}>
                {selectedTerm ? `${selectedTerm.termMonths} tháng` : 'Chưa chọn'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Lãi suất:</Text>
              <Text style={styles.summaryValue}>
                {selectedTerm ? `${selectedTerm.annualRate}%/năm` : 'Chưa chọn'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số tiền gửi:</Text>
              <Text style={[styles.summaryValue, styles.amountValue]}>
                {initialAmount ? formatCurrency(parseCurrency(initialAmount)) : '0 ₫'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đơn vị tiền tệ:</Text>
              <Text style={styles.summaryValue}>VND</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Nút tạo tài khoản */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, creating && styles.disabledButton]}
          onPress={handleCreateAccount}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Tạo tài khoản</Text>
          )}
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận tạo tài khoản"
        message={`Bạn có chắc chắn muốn tạo tài khoản tiết kiệm với số tiền ${initialAmount ? formatCurrency(parseCurrency(initialAmount)) : '0 ₫'}?`}
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />

      <PinInputModal
        visible={showPinModal}
        title="Nhập mã PIN"
        message="Vui lòng nhập mã PIN để xác nhận tạo tài khoản tiết kiệm"
        onConfirm={() => {
          setShowPinModal(false);
          performCreateAccount();
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  termCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTermCard: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  termRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  termDuration: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  termAmount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  termDescription: {
    fontSize: 12,
    color: '#999999',
  },
  amountHint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },

  linkedAccountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  linkedAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  linkedAccountSubText: {
    fontSize: 12,
    color: '#666666',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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