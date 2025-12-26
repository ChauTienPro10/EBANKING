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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ChevronDown, Filter } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Data4GService, { DataPackage } from '../../services/Data4GService';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import Header from '../../components/Header';
import {
  translatePackageName,
  translatePackageDescription,
  translateValidity,
} from '../../utils/translationHelpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Data4G'>;

const Data4GScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector(
    (state: RootState) => state.app,
  );

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(
    null,
  );
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<DataPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'price' | 'dataAmount' | 'validityDays'>(
    'price',
  );
  const [recentNumbers] = useState(['0987654321', '0912345678', '0901234567']);

  const providers = [
    { code: 'VIETTEL', name: 'Viettel' },
    { code: 'VINAPHONE', name: 'VinaPhone' },
    { code: 'MOBIFONE', name: 'MobiFone' },
    { code: 'VIETNAMOBILE', name: 'Vietnamobile' },
  ];

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      detectProvider();
    } else {
      setSelectedProvider('');
      setPackages([]);
      setFilteredPackages([]);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (selectedProvider) {
      loadPackages();
    }
  }, [selectedProvider]);

  useEffect(() => {
    applyFilters();
  }, [packages, priceFilter, sortBy]);

  const detectProvider = () => {
    const providerCode =
      Data4GService.detectProviderFromPhoneNumber(phoneNumber);
    if (providerCode && providerCode !== selectedProvider) {
      setSelectedProvider(providerCode);
      setSelectedPackage(null);
    }
  };

  const loadPackages = async () => {
    if (!selectedProvider) return;

    try {
      setLoading(true);
      const data = await Data4GService.getDataPackagesByProviderCode(
        selectedProvider,
      );
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert(t('common.error'), t('data_4g.validation.package_required'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Apply price filter
    if (priceFilter.min || priceFilter.max) {
      const minPrice = priceFilter.min
        ? parseInt(priceFilter.min.replace(/\D/g, ''))
        : undefined;
      const maxPrice = priceFilter.max
        ? parseInt(priceFilter.max.replace(/\D/g, ''))
        : undefined;
      filtered = Data4GService.filterPackagesByPrice(
        filtered,
        minPrice,
        maxPrice,
      );
    }

    // Apply sorting
    filtered = Data4GService.sortPackages(filtered, sortBy);

    setFilteredPackages(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }

    if (!Data4GService.validatePhoneNumber(phoneNumber)) {
      Alert.alert(t('common.error'), t('data_4g.validation.phone_invalid'));
      return false;
    }

    if (!selectedProvider) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhà mạng');
      return false;
    }

    if (!selectedPackage) {
      Alert.alert('Lỗi', 'Vui lòng chọn gói data');
      return false;
    }

    return true;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    navigation.navigate('Data4GConfirm', {
      phoneNumber: Data4GService.formatPhoneNumber(phoneNumber),
      provider: selectedProvider,
      package: selectedPackage!,
    });
  };

  const renderProviderItem = ({
    item,
  }: {
    item: { code: string; name: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.providerItem,
        selectedProvider === item.code && styles.providerItemSelected,
      ]}
      onPress={() => {
        setSelectedProvider(item.code);
        setSelectedPackage(null);
        setShowProviderModal(false);
      }}
    >
      <Text style={styles.providerName}>{item.name}</Text>
      {selectedProvider === item.code && (
        <Ionicons name="checkmark-circle" size={22} color="#09a0a5" />
      )}
    </TouchableOpacity>
  );

  const renderPackageItem = ({ item }: { item: DataPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        selectedPackage?.packageId === item.packageId &&
          styles.packageItemSelected,
      ]}
      onPress={() => setSelectedPackage(item)}
    >
      <View style={styles.packageContent}>
        {/* Left side - Checkmark indicator */}
        <View style={styles.packageCheckContainer}>
          {selectedPackage?.packageId === item.packageId && (
            <Ionicons name="checkmark-circle" size={24} color="#09a0a5" />
          )}
        </View>

        {/* Main content */}
        <View style={styles.packageMainContent}>
          {/* Header row with name and price */}
          <View style={styles.packageHeader}>
            <Text style={styles.packageName}>
              {translatePackageName(item.packageName)}
            </Text>
            <Text style={styles.packagePrice}>
              {formatCurrency(item.price)}
            </Text>
          </View>

          {/* Data and validity row */}
          <View style={styles.packageDetails}>
            <Text style={styles.packageData}>{item.formattedDataAmount}</Text>
            <Text style={styles.packageValidity}>
              {translateValidity(
                Data4GService.formatValidity(item.validityDays),
              )}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.packageDescription}>
            {translatePackageDescription(item.description)}
          </Text>
        </View>
      </View>
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

  const getSelectedProviderName = () => {
    const provider = providers.find(p => p.code === selectedProvider);
    return provider?.name || t('data_4g.select_provider');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title={t('data_4g.title')} showBackButton />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info - Removed as it's redundant with page title */}

        {/* Recent Numbers */}
        {recentNumbers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('data_4g.recent_numbers')}
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
          <Text style={styles.label}>{t('data_4g.phone_number')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('data_4g.phone_number_placeholder')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('data_4g.provider')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowProviderModal(true)}
          >
            <Text
              style={[
                styles.selectorText,
                !selectedProvider && styles.selectorPlaceholder,
              ]}
            >
              {getSelectedProviderName()}
            </Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Package Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <View style={styles.packageFilterHeader}>
              <Text style={styles.label}>{t('data_4g.package')}</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <Filter size={16} color="#2196F3" />
                <Text style={styles.filterText}>{t('data_4g.filter')}</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPackages}
                renderItem={renderPackageItem}
                keyExtractor={item => item.packageId.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {t('data_4g.select_package')}
                  </Text>
                }
              />
            )}
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!phoneNumber || !selectedProvider || !selectedPackage) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!phoneNumber || !selectedProvider || !selectedPackage}
        >
          <Text style={styles.confirmButtonText}>
            {t('data_4g.confirm_button')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Provider Modal */}
      {showProviderModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('data_4g.select_provider')}
            </Text>
            <FlatList
              data={providers}
              renderItem={renderProviderItem}
              keyExtractor={item => item.code}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProviderModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{t('data_4g.filter_title')}</Text>

            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('data_4g.price_range')}</Text>
              <View style={styles.priceFilterRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('data_4g.price_from')}
                  value={priceFilter.min}
                  onChangeText={text =>
                    setPriceFilter(prev => ({ ...prev, min: text }))
                  }
                  keyboardType="numeric"
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('data_4g.price_to')}
                  value={priceFilter.max}
                  onChangeText={text =>
                    setPriceFilter(prev => ({ ...prev, max: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('data_4g.sort_by')}</Text>
              {[
                { key: 'price', label: t('data_4g.sort_price') },
                { key: 'dataAmount', label: t('data_4g.sort_data') },
                { key: 'validityDays', label: t('data_4g.sort_validity') },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                  {sortBy === option.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#09a0a5"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={styles.filterResetButton}
                onPress={() => {
                  setPriceFilter({ min: '', max: '' });
                  setSortBy('price');
                }}
              >
                <Text style={styles.filterResetText}>{t('data_4g.reset')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.filterApplyText}>{t('data_4g.apply')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  selector: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorText: {
    fontSize: 15,
    color: '#111827',
  },
  selectorPlaceholder: {
    color: '#9CA3AF',
  },
  packageFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0F7F8',
    borderRadius: 6,
  },
  filterText: {
    fontSize: 13,
    color: '#09a0a5',
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    padding: 32,
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
    borderColor: '#E5E7EB',
  },
  recentNumberText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  packageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  packageItemSelected: {
    borderColor: '#09a0a5',
    backgroundColor: '#F0FDFD',
    borderWidth: 2,
    shadowColor: '#09a0a5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  packageCheckContainer: {
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
  },
  packageMainContent: {
    flex: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  packagePrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09a0a5',
  },
  packageDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  packageData: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginRight: 12,
  },
  packageValidity: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  packageDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  confirmButton: {
    backgroundColor: '#09a0a5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#09a0a5',
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
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 300,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerItemSelected: {
    backgroundColor: '#E0F7F8',
    borderColor: '#09a0a5',
    borderWidth: 1.5,
  },
  providerName: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
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
    color: '#374151',
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 28,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    color: '#111827',
    fontWeight: '500',
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  filterResetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '700',
  },
  filterApplyButton: {
    flex: 1,
    backgroundColor: '#09a0a5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#09a0a5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterApplyText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default Data4GScreen;
