import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ChevronDown } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MobilePrepaidService, {
  MobileOperator,
  Denomination,
} from '../../services/MobilePrepaidService';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import Header from '../../components/Header';
import Colors from '../../constants/color';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MobilePrepaid'
>;

const MobilePrepaidScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector(
    (state: RootState) => state.app,
  );

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] =
    useState<MobileOperator | null>(null);
  const [selectedDenomination, setSelectedDenomination] =
    useState<Denomination | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [operators, setOperators] = useState<MobileOperator[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showDenominationModal, setShowDenominationModal] = useState(false);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [recentNumbers] = useState(['0987654321', '0912345678', '0901234567']);

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      detectOperator();
    } else {
      setSelectedOperator(null);
      setSelectedDenomination(null);
    }
  }, [phoneNumber]);

  const loadOperators = async () => {
    try {
      const data = await MobilePrepaidService.getMobileOperators();
      setOperators(data);
    } catch (error) {
      console.error('Error loading operators:', error);
    }
  };

  const detectOperator = async () => {
    try {
      const operator = await MobilePrepaidService.detectOperator(phoneNumber);
      if (operator && operator.providerId !== selectedOperator?.providerId) {
        setSelectedOperator(operator);
        setSelectedDenomination(null);
        setCustomAmount('');
        setUseCustomAmount(false);
      }
    } catch (error) {
      console.error('Error detecting operator:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      Alert.alert(
        t('common.error'),
        t('mobile_prepaid.validation.phone_required'),
      );
      return false;
    }

    if (!MobilePrepaidService.validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        t('common.error'),
        t('mobile_prepaid.validation.phone_invalid'),
      );
      return false;
    }

    if (!selectedOperator) {
      Alert.alert(
        t('common.error'),
        t('mobile_prepaid.validation.operator_required'),
      );
      return false;
    }

    const amount = useCustomAmount
      ? parseInt(customAmount.replace(/\D/g, ''))
      : selectedDenomination?.amount;

    if (!amount || amount <= 0) {
      Alert.alert(
        t('common.error'),
        t('mobile_prepaid.validation.amount_required'),
      );
      return false;
    }

    if (!MobilePrepaidService.validateAmount(amount, selectedOperator)) {
      Alert.alert(
        t('common.error'),
        `Số tiền phải từ ${formatCurrency(
          selectedOperator.minAmount,
        )} đến ${formatCurrency(selectedOperator.maxAmount)}`,
      );
      return false;
    }

    return true;
  };

  const getSelectedAmount = (): number => {
    return useCustomAmount
      ? parseInt(customAmount.replace(/\D/g, '')) || 0
      : selectedDenomination?.amount || 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    const amount = getSelectedAmount();
    const fee = selectedOperator
      ? MobilePrepaidService.calculateFee(amount, selectedOperator)
      : 0;
    const totalAmount = selectedOperator
      ? MobilePrepaidService.calculateTotalAmount(amount, selectedOperator)
      : amount;

    navigation.navigate('MobilePrepaidConfirm', {
      phoneNumber: MobilePrepaidService.formatPhoneNumber(phoneNumber),
      operator: selectedOperator!,
      amount,
      fee,
      totalAmount,
    });
  };

  const renderOperatorItem = ({ item }: { item: MobileOperator }) => (
    <TouchableOpacity
      style={[
        styles.operatorItem,
        selectedOperator?.providerId === item.providerId &&
          styles.operatorItemSelected,
      ]}
      onPress={() => {
        setSelectedOperator(item);
        setSelectedDenomination(null);
        setCustomAmount('');
        setUseCustomAmount(false);
        setShowOperatorModal(false);
      }}
    >
      <Image source={{ uri: item.logoUrl }} style={styles.operatorLogo} />
      <Text style={styles.operatorName}>{item.providerName}</Text>
      {selectedOperator?.providerId === item.providerId && (
        <Ionicons name="checkmark-circle" size={22} color={Colors.main_bule} />
      )}
    </TouchableOpacity>
  );

  const renderDenominationItem = ({ item }: { item: Denomination }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        selectedDenomination?.denominationId === item.denominationId &&
          styles.packageItemSelected,
      ]}
      onPress={() => {
        setSelectedDenomination(item);
        setUseCustomAmount(false);
        setCustomAmount('');
        setShowDenominationModal(false);
      }}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageAmount}>{item.displayName}</Text>
      </View>
      <Text style={styles.packageDescription}>
        Nạp tiền {formatCurrency(item.amount)}
      </Text>
      {selectedDenomination?.denominationId === item.denominationId && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={Colors.main_bule}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const renderRecentNumber = (number: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentNumberItem}
      onPress={() => setPhoneNumber(number)}
    >
      <Text style={styles.recentNumberText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title={t('mobile_prepaid.title')} showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Numbers */}
        {recentNumbers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('mobile_prepaid.recent_numbers')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recentNumbers}>
                {recentNumbers.map(renderRecentNumber)}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('mobile_prepaid.phone_number')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('mobile_prepaid.phone_number_placeholder')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        {/* Operator Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('mobile_prepaid.select_operator')}
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowOperatorModal(true)}
          >
            {selectedOperator ? (
              <View style={styles.selectedOperator}>
                <Image
                  source={{ uri: selectedOperator.logoUrl }}
                  style={styles.operatorLogoSmall}
                />
                <Text style={styles.selectedOperatorText}>
                  {selectedOperator.providerName}
                </Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                {t('mobile_prepaid.auto_detect')}
              </Text>
            )}
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Amount Selection */}
        {selectedOperator && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('mobile_prepaid.select_amount')}
            </Text>

            {/* Denomination buttons */}
            <View style={styles.denominationGrid}>
              {selectedOperator.denominations.map(denomination => (
                <TouchableOpacity
                  key={denomination.denominationId}
                  style={[
                    styles.denominationButton,
                    selectedDenomination?.denominationId ===
                      denomination.denominationId &&
                      !useCustomAmount &&
                      styles.denominationButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedDenomination(denomination);
                    setUseCustomAmount(false);
                    setCustomAmount('');
                  }}
                >
                  <Text
                    style={[
                      styles.denominationText,
                      selectedDenomination?.denominationId ===
                        denomination.denominationId &&
                        !useCustomAmount &&
                        styles.denominationTextSelected,
                    ]}
                  >
                    {denomination.displayName}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom amount option as grid item */}
              <TouchableOpacity
                style={[
                  styles.denominationButton,
                  useCustomAmount && styles.denominationButtonSelected,
                ]}
                onPress={() => {
                  setUseCustomAmount(true);
                  setSelectedDenomination(null);
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={
                    useCustomAmount ? Colors.main_bule : Colors.textSecondary
                  }
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.denominationText,
                    useCustomAmount && styles.denominationTextSelected,
                  ]}
                >
                  Khác
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom amount input */}
            {useCustomAmount && (
              <TextInput
                style={styles.customAmountInput}
                placeholder={`Từ ${formatCurrency(
                  selectedOperator.minAmount,
                )} đến ${formatCurrency(selectedOperator.maxAmount)}`}
                value={customAmount}
                onChangeText={text => {
                  const numericValue = text.replace(/\D/g, '');
                  const formattedValue = numericValue
                    ? formatCurrency(parseInt(numericValue))
                    : '';
                  setCustomAmount(formattedValue);
                }}
                keyboardType="numeric"
              />
            )}

            {/* Fee information */}
            {(selectedDenomination || (useCustomAmount && customAmount)) && (
              <View style={styles.feeInfo}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>
                    {t('mobile_prepaid.amount_label')}
                  </Text>
                  <Text style={styles.feeValue}>
                    {formatCurrency(getSelectedAmount())}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>
                    {t('mobile_prepaid.fee_label')}
                  </Text>
                  <Text style={styles.feeValue}>
                    {formatCurrency(
                      MobilePrepaidService.calculateFee(
                        getSelectedAmount(),
                        selectedOperator,
                      ),
                    )}
                  </Text>
                </View>
                <View style={[styles.feeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>
                    {t('mobile_prepaid.total_label')}
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(
                      MobilePrepaidService.calculateTotalAmount(
                        getSelectedAmount(),
                        selectedOperator,
                      ),
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!phoneNumber ||
              !selectedOperator ||
              (!selectedDenomination && !useCustomAmount) ||
              (useCustomAmount && !customAmount)) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={
            !phoneNumber ||
            !selectedOperator ||
            (!selectedDenomination && !useCustomAmount) ||
            (useCustomAmount && !customAmount)
          }
        >
          <Text style={styles.confirmButtonText}>
            {t('mobile_prepaid.confirm_topup')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Operator Modal */}
      {showOperatorModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('mobile_prepaid.select_operator')}
            </Text>
            <FlatList
              data={operators}
              renderItem={renderOperatorItem}
              keyExtractor={item => item.providerId.toString()}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowOperatorModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Denomination Modal */}
      {showDenominationModal && selectedOperator && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('mobile_prepaid.select_amount')}
            </Text>
            <FlatList
              data={selectedOperator.denominations}
              renderItem={renderDenominationItem}
              keyExtractor={item => item.denominationId.toString()}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDenominationModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  selector: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  selectedOperator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorLogoSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedOperatorText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  selectedPackageAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedPackageBonus: {
    color: '#4CAF50',
  },
  selectedPackageDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recentNumbers: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  recentNumberItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentNumberText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.main_bule,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 300,
  },
  operatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  operatorItemSelected: {
    backgroundColor: '#E0F7F8',
    borderColor: Colors.main_bule,
    borderWidth: 1.5,
  },
  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  operatorName: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  packageItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  packageItemSelected: {
    borderColor: Colors.main_bule,
    backgroundColor: '#F0FDFD',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  packageBonus: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  packageDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  packageValidity: {
    fontSize: 12,
    color: '#999',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  denominationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  denominationButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
    width: '31.5%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  denominationButtonSelected: {
    backgroundColor: '#E0F7F8',
    borderColor: Colors.main_bule,
    borderWidth: 2,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  denominationText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  denominationTextSelected: {
    color: Colors.main_bule,
    fontWeight: '700',
  },
  customAmountButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  customAmountButtonSelected: {
    backgroundColor: '#E0F7F8',
    borderColor: Colors.main_bule,
    borderWidth: 2,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  customAmountText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  customAmountTextSelected: {
    color: Colors.main_bule,
    fontWeight: '700',
  },
  customAmountInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: Colors.main_bule,
    borderRadius: 10,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  feeInfo: {
    backgroundColor: '#F0FDFD',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#B8E6E8',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#B8E6E8',
    paddingTop: 14,
    marginTop: 6,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.main_bule,
  },
});

export default MobilePrepaidScreen;
