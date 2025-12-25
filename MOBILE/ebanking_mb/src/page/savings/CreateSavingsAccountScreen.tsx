import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { RootState, AppDispatch } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsTermType } from '../../types/SavingsTypes';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';
import Header from '../../components/Header';
import PinInputModal from '../../components/PinInputModal';
import Colors from '../../constants/color';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateSavingsAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector(
    (state: RootState) => state.app,
  );

  const [selectedTerm, setSelectedTerm] = useState<SavingsTermType | null>(
    null,
  );
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
    return new Intl.NumberFormat('vi-VN').format(amount);
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
        text2: `Số tiền gửi tối thiểu là ${formatCurrency(
          selectedTerm.minAmount,
        )} ₫`,
      });
      return false;
    }

    // No max amount validation since we removed the limit
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
          <ActivityIndicator size="large" color={Colors.main_bule} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mở tài khoản tiết kiệm" showBackButton />

      <ScrollView style={styles.content}>
        {/* Tài khoản thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản thanh toán</Text>
          <View style={styles.linkedAccountCard}>
            <View style={styles.linkedAccountHeader}>
              <Ionicons name="card" size={20} color={Colors.main_bule} />
              <Text style={styles.linkedAccountText}>
                {accountTransResponse?.accountNumber ||
                  'Chưa có tài khoản thanh toán'}
              </Text>
            </View>
            <View style={styles.linkedAccountDetails}>
              <View style={styles.linkedAccountRow}>
                <Text style={styles.linkedAccountLabel}>Tên:</Text>
                <Text style={styles.linkedAccountValue}>
                  {userInfo?.fullName || 'N/A'}
                </Text>
              </View>
              <View style={styles.linkedAccountRow}>
                <Text style={styles.linkedAccountLabel}>Loại:</Text>
                <Text style={styles.linkedAccountValue}>
                  {accountTransResponse?.accountType || 'N/A'}
                </Text>
              </View>
              <View style={styles.linkedAccountRow}>
                <Text style={styles.linkedAccountLabel}>Số dư:</Text>
                <Text style={[styles.linkedAccountValue, styles.balanceValue]}>
                  {accountTransResponse
                    ? `${formatCurrency(accountTransResponse.balance)} ₫`
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Số tiền gửi ban đầu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số tiền gửi ban đầu</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="cash-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={
                initialAmount
                  ? formatCurrency(parseCurrency(initialAmount))
                  : ''
              }
              onChangeText={handleAmountChange}
              placeholder="Nhập số tiền"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={styles.currencyLabel}>₫</Text>
          </View>
        </View>

        {/* Chọn kỳ hạn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn kỳ hạn gửi tiết kiệm</Text>
          <Text style={styles.sectionSubtitle}>
            Nhận lãi cuối kỳ. Rút trước hạn hưởng lãi không kỳ hạn.
          </Text>
          {terms.map(term => {
            const amount = parseCurrency(initialAmount);
            const hasAmount = amount > 0;
            const interest = hasAmount
              ? Math.round(amount * term.annualRate * (term.termMonths / 12))
              : 0;
            const totalAmount = amount + interest;
            const isSelected =
              selectedTerm?.interestRateId === term.interestRateId;

            return (
              <View key={term.interestRateId}>
                <TouchableOpacity
                  style={[
                    styles.termCard,
                    isSelected && styles.selectedTermCard,
                  ]}
                  onPress={() => {
                    // Toggle: if already selected, deselect; otherwise select
                    setSelectedTerm(isSelected ? null : term);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.termHeader}>
                    <View style={styles.termLeft}>
                      <View
                        style={[
                          styles.termIconContainer,
                          isSelected && styles.selectedTermIconContainer,
                        ]}
                      >
                        <Ionicons
                          name="calendar"
                          size={20}
                          color={
                            isSelected ? Colors.main_bule : Colors.textSecondary
                          }
                        />
                      </View>
                      <View>
                        <Text style={styles.termName}>{term.name}</Text>
                        <Text style={styles.termDuration}>
                          {term.termMonths} tháng
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.termRate,
                        isSelected && styles.selectedTermRate,
                      ]}
                    >
                      {(term.annualRate * 100).toFixed(2)}%/năm
                    </Text>
                  </View>
                  <Text style={styles.termAmount}>
                    Số tiền: {formatCurrency(term.minAmount)} ₫ trở lên
                  </Text>
                  <Text style={styles.termDescription}>{term.description}</Text>
                </TouchableOpacity>

                {/* Interest Preview - Only show when THIS term is selected AND amount is valid */}
                {isSelected && hasAmount && amount >= term.minAmount && (
                  <View style={styles.interestPreview}>
                    <View style={styles.previewIconRow}>
                      <Ionicons
                        name="cash"
                        size={18}
                        color={Colors.main_bule}
                      />
                      <Text style={styles.previewMainText}>
                        Bạn sẽ nhận được{' '}
                        <Text style={styles.previewHighlight}>
                          {formatCurrency(totalAmount)} ₫
                        </Text>{' '}
                        sau {term.termMonths} tháng
                      </Text>
                    </View>
                    <View style={styles.previewSubRow}>
                      <Text style={styles.previewSubText}>
                        Lãi:{' '}
                        <Text style={styles.previewInterestAmount}>
                          +{formatCurrency(interest)} ₫
                        </Text>{' '}
                        (
                        {formatCurrency(Math.round(interest / term.termMonths))}{' '}
                        ₫/tháng)
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Nút tạo tài khoản */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, creating && styles.disabledButton]}
          onPress={handleCreateAccount}
          disabled={creating}
          activeOpacity={0.8}
        >
          {creating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.createButtonText}>Tạo tài khoản</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận tạo tài khoản</Text>

            {selectedTerm && initialAmount && (
              <View style={styles.modalDetailsCard}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Kỳ hạn:</Text>
                  <Text style={styles.modalValue}>
                    {selectedTerm.termMonths} tháng
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Lãi suất:</Text>
                  <Text style={styles.modalValue}>
                    {(selectedTerm.annualRate * 100).toFixed(2)}%/năm
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Số tiền gửi:</Text>
                  <Text style={[styles.modalValue, styles.modalAmountValue]}>
                    {formatCurrency(parseCurrency(initialAmount))} ₫
                  </Text>
                </View>
                <View style={styles.modalDivider} />
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabelBold}>Lãi dự kiến:</Text>
                  <Text style={[styles.modalValue, styles.modalInterestValue]}>
                    {formatCurrency(
                      Math.round(
                        parseCurrency(initialAmount) *
                          selectedTerm.annualRate *
                          (selectedTerm.termMonths / 12),
                      ),
                    )}{' '}
                    ₫
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmCreate}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    backgroundColor: Colors.background,
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
    fontSize: 15,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  termCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedTermCard: {
    borderColor: Colors.main_bule,
    backgroundColor: `${Colors.main_bule}08`,
    shadowColor: Colors.main_bule,
    shadowOpacity: 0.15,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  termLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  termIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedTermIconContainer: {
    backgroundColor: `${Colors.main_bule}15`,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  termRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  selectedTermRate: {
    color: Colors.main_bule,
  },
  termDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  termAmount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  termDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  amountHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  linkedAccountCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  linkedAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkedAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 10,
    fontFamily: 'monospace',
  },
  linkedAccountDetails: {
    gap: 8,
  },
  linkedAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkedAccountLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  linkedAccountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  balanceValue: {
    color: Colors.main_bule,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryLabelBold: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  amountValue: {
    color: Colors.main_bule,
    fontSize: 15,
  },
  interestValue: {
    color: '#10B981',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  interestPreview: {
    backgroundColor: `${Colors.main_bule}08`,
    borderWidth: 1,
    borderColor: Colors.main_bule,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -11,
    marginBottom: 10,
  },
  previewIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewMainText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  previewHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.main_bule,
  },
  previewSubRow: {
    paddingLeft: 26,
  },
  previewSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  previewInterestAmount: {
    fontWeight: '600',
    color: '#10B981',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetailsCard: {
    backgroundColor: `${Colors.main_bule}08`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalLabelBold: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  modalAmountValue: {
    color: Colors.main_bule,
    fontSize: 15,
  },
  modalInterestValue: {
    color: '#10B981',
    fontSize: 15,
  },
  modalDivider: {
    height: 1,
    backgroundColor: `${Colors.main_bule}20`,
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
