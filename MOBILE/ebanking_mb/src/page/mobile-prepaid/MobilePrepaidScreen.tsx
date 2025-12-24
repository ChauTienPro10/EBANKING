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
import { Smartphone, ChevronDown, Check } from 'lucide-react-native';

import MobilePrepaidService, {
  MobileOperator,
  Denomination,
} from '../../services/MobilePrepaidService';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MobilePrepaid'>;

const MobilePrepaidScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector((state: RootState) => state.app);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination | null>(null);
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
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.phone_required'));
      return false;
    }

    if (!MobilePrepaidService.validatePhoneNumber(phoneNumber)) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.phone_invalid'));
      return false;
    }

    if (!selectedOperator) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.operator_required'));
      return false;
    }

    const amount = useCustomAmount ? parseInt(customAmount.replace(/\D/g, '')) : selectedDenomination?.amount;
    
    if (!amount || amount <= 0) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.amount_required'));
      return false;
    }

    if (!MobilePrepaidService.validateAmount(amount, selectedOperator)) {
      Alert.alert(
        t('common.error'), 
        `Số tiền phải từ ${formatCurrency(selectedOperator.minAmount)} đến ${formatCurrency(selectedOperator.maxAmount)}`
      );
      return false;
    }

    return true;
  };

  const getSelectedAmount = (): number => {
    return useCustomAmount ? parseInt(customAmount.replace(/\D/g, '')) || 0 : selectedDenomination?.amount || 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    const amount = getSelectedAmount();
    const fee = selectedOperator ? MobilePrepaidService.calculateFee(amount, selectedOperator) : 0;
    const totalAmount = selectedOperator ? MobilePrepaidService.calculateTotalAmount(amount, selectedOperator) : amount;

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
        selectedOperator?.providerId === item.providerId && styles.operatorItemSelected,
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
        <Check size={20} color="#4CAF50" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const renderDenominationItem = ({ item }: { item: Denomination }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        selectedDenomination?.denominationId === item.denominationId && styles.packageItemSelected,
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
      <Text style={styles.packageDescription}>Nạp tiền {formatCurrency(item.amount)}</Text>
      {selectedDenomination?.denominationId === item.denominationId && (
        <Check size={20} color="#4CAF50" style={styles.checkIcon} />
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
    <View style={styles.container}>
      <>
      <Header title={t('mobile_prepaid.title')} showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Smartphone size={24} color="#2196F3" />
          <Text style={styles.subtitle}>{t('mobile_prepaid.subtitle')}</Text>
        </View>

        {/* Recent Numbers */}
        {recentNumbers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_prepaid.recent_numbers')}</Text>
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
          <Text style={styles.label}>{t('mobile_prepaid.select_operator')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowOperatorModal(true)}
          >
            {selectedOperator ? (
              <View style={styles.selectedOperator}>
                <Image source={{ uri: selectedOperator.logoUrl }} style={styles.operatorLogoSmall} />
                <Text style={styles.selectedOperatorText}>{selectedOperator.providerName}</Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>{t('mobile_prepaid.auto_detect')}</Text>
            )}
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Amount Selection */}
        {selectedOperator && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('mobile_prepaid.select_amount')}</Text>
            
            {/* Denomination buttons */}
            <View style={styles.denominationGrid}>
              {selectedOperator.denominations.map((denomination) => (
                <TouchableOpacity
                  key={denomination.denominationId}
                  style={[
                    styles.denominationButton,
                    selectedDenomination?.denominationId === denomination.denominationId && 
                    !useCustomAmount && styles.denominationButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedDenomination(denomination);
                    setUseCustomAmount(false);
                    setCustomAmount('');
                  }}
                >
                  <Text style={[
                    styles.denominationText,
                    selectedDenomination?.denominationId === denomination.denominationId && 
                    !useCustomAmount && styles.denominationTextSelected,
                  ]}>
                    {denomination.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom amount option */}
            <TouchableOpacity
              style={[
                styles.customAmountButton,
                useCustomAmount && styles.customAmountButtonSelected,
              ]}
              onPress={() => {
                setUseCustomAmount(true);
                setSelectedDenomination(null);
              }}
            >
              <Text style={[
                styles.customAmountText,
                useCustomAmount && styles.customAmountTextSelected,
              ]}>
                Số tiền khác
              </Text>
            </TouchableOpacity>

            {/* Custom amount input */}
            {useCustomAmount && (
              <TextInput
                style={styles.customAmountInput}
                placeholder={`Từ ${formatCurrency(selectedOperator.minAmount)} đến ${formatCurrency(selectedOperator.maxAmount)}`}
                value={customAmount}
                onChangeText={(text) => {
                  const numericValue = text.replace(/\D/g, '');
                  const formattedValue = numericValue ? formatCurrency(parseInt(numericValue)) : '';
                  setCustomAmount(formattedValue);
                }}
                keyboardType="numeric"
              />
            )}

            {/* Fee information */}
            {(selectedDenomination || (useCustomAmount && customAmount)) && (
              <View style={styles.feeInfo}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Số tiền nạp:</Text>
                  <Text style={styles.feeValue}>{formatCurrency(getSelectedAmount())}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Phí giao dịch:</Text>
                  <Text style={styles.feeValue}>
                    {formatCurrency(MobilePrepaidService.calculateFee(getSelectedAmount(), selectedOperator))}
                  </Text>
                </View>
                <View style={[styles.feeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(MobilePrepaidService.calculateTotalAmount(getSelectedAmount(), selectedOperator))}
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
            (!phoneNumber || !selectedOperator || (!selectedDenomination && !useCustomAmount) || 
             (useCustomAmount && !customAmount)) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!phoneNumber || !selectedOperator || (!selectedDenomination && !useCustomAmount) || 
                   (useCustomAmount && !customAmount)}
        >
          <Text style={styles.confirmButtonText}>{t('mobile_prepaid.confirm_topup')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Operator Modal */}
      {showOperatorModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('mobile_prepaid.select_operator')}</Text>
            <FlatList
              data={operators}
              renderItem={renderOperatorItem}
              keyExtractor={(item) => item.providerId.toString()}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowOperatorModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Denomination Modal */}
      {showDenominationModal && selectedOperator && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('mobile_prepaid.select_amount')}</Text>
            <FlatList
              data={selectedOperator.denominations}
              renderItem={renderDenominationItem}
              keyExtractor={(item) => item.denominationId.toString()}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDenominationModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#999',
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
    fontSize: 16,
    color: '#333',
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
  },
  recentNumberItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recentNumberText: {
    fontSize: 14,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 400,
  },
  operatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  operatorItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  operatorName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  packageItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  packageItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  packageBonus: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  packageValidity: {
    fontSize: 12,
    color: '#999',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalCloseButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#333',
  },
  loader: {
    padding: 40,
  },
  denominationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  denominationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '30%',
    alignItems: 'center',
  },
  denominationButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  denominationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  denominationTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  customAmountButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  customAmountButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  customAmountText: {
    fontSize: 16,
    color: '#333',
  },
  customAmountTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  customAmountInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  feeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default MobilePrepaidScreen;