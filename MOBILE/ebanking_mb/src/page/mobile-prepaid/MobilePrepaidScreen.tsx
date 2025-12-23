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
import { Smartphone, ChevronDown, Check } from 'lucide-react-native';

import MobilePrepaidService, {
  MobileOperator,
  PrepaidPackage,
  PrepaidRequest,
} from '../../services/MobilePrepaidService';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MobilePrepaid'>;

const MobilePrepaidScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PrepaidPackage | null>(null);
  const [operators, setOperators] = useState<MobileOperator[]>([]);
  const [packages, setPackages] = useState<PrepaidPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [recentNumbers] = useState(['0987654321', '0912345678', '0901234567']);

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      detectOperator();
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (selectedOperator) {
      loadPackages();
    }
  }, [selectedOperator]);

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
      if (operator && operator.id !== selectedOperator?.id) {
        setSelectedOperator(operator);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error detecting operator:', error);
    }
  };

  const loadPackages = async () => {
    if (!selectedOperator) return;
    
    try {
      setLoading(true);
      const data = await MobilePrepaidService.getPrepaidPackages(selectedOperator.id);
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
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

    if (phoneNumber.replace(/\D/g, '').length < 10) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.phone_invalid'));
      return false;
    }

    if (!selectedOperator) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.operator_required'));
      return false;
    }

    if (!selectedPackage) {
      Alert.alert(t('common.error'), t('mobile_prepaid.validation.package_required'));
      return false;
    }

    return true;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    navigation.navigate('MobilePrepaidConfirm', {
      phoneNumber,
      operator: selectedOperator,
      package: selectedPackage,
    });
  };

  const renderOperatorItem = ({ item }: { item: MobileOperator }) => (
    <TouchableOpacity
      style={[
        styles.operatorItem,
        selectedOperator?.id === item.id && styles.operatorItemSelected,
      ]}
      onPress={() => {
        setSelectedOperator(item);
        setSelectedPackage(null);
        setShowOperatorModal(false);
      }}
    >
      <Image source={{ uri: item.logo }} style={styles.operatorLogo} />
      <Text style={styles.operatorName}>{item.name}</Text>
      {selectedOperator?.id === item.id && (
        <Check size={20} color="#4CAF50" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const renderPackageItem = ({ item }: { item: PrepaidPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        selectedPackage?.id === item.id && styles.packageItemSelected,
      ]}
      onPress={() => {
        setSelectedPackage(item);
        setShowPackageModal(false);
      }}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageAmount}>{formatCurrency(item.amount)}</Text>
        {item.bonus > 0 && (
          <Text style={styles.packageBonus}>+{formatCurrency(item.bonus)} KM</Text>
        )}
      </View>
      <Text style={styles.packageDescription}>{item.description}</Text>
      <Text style={styles.packageValidity}>{t('mobile_prepaid.validity')}: {item.validity}</Text>
      {selectedPackage?.id === item.id && (
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Smartphone size={24} color="#2196F3" />
          <Text style={styles.title}>{t('mobile_prepaid.title')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('mobile_prepaid.subtitle')}</Text>

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
                <Image source={{ uri: selectedOperator.logo }} style={styles.operatorLogoSmall} />
                <Text style={styles.selectedOperatorText}>{selectedOperator.name}</Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>{t('mobile_prepaid.auto_detect')}</Text>
            )}
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Package Selection */}
        {selectedOperator && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('mobile_prepaid.select_package')}</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowPackageModal(true)}
            >
              {selectedPackage ? (
                <View>
                  <Text style={styles.selectedPackageAmount}>
                    {formatCurrency(selectedPackage.amount)}
                    {selectedPackage.bonus > 0 && (
                      <Text style={styles.selectedPackageBonus}>
                        {' '}+{formatCurrency(selectedPackage.bonus)} KM
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.selectedPackageDescription}>
                    {selectedPackage.description}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectorPlaceholder}>
                  {loading ? t('common.loading') : t('mobile_prepaid.select_package')}
                </Text>
              )}
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!phoneNumber || !selectedOperator || !selectedPackage) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!phoneNumber || !selectedOperator || !selectedPackage}
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
              keyExtractor={(item) => item.id}
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

      {/* Package Modal */}
      {showPackageModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('mobile_prepaid.select_package')}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
            ) : (
              <FlatList
                data={packages}
                renderItem={renderPackageItem}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPackageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.close')}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
});

export default MobilePrepaidScreen;