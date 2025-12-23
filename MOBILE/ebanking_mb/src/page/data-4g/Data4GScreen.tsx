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
import { Wifi, ChevronDown, Check, Filter } from 'lucide-react-native';

import Data4GService, { DataPackage } from '../../services/Data4GService';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Data4G'>;

const Data4GScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo, accountTransResponse } = useSelector((state: RootState) => state.app);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(null);
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<DataPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'price' | 'dataAmount' | 'validityDays'>('price');
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
    const providerCode = Data4GService.detectProviderFromPhoneNumber(phoneNumber);
    if (providerCode && providerCode !== selectedProvider) {
      setSelectedProvider(providerCode);
      setSelectedPackage(null);
    }
  };

  const loadPackages = async () => {
    if (!selectedProvider) return;
    
    try {
      setLoading(true);
      const data = await Data4GService.getDataPackagesByProviderCode(selectedProvider);
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách gói data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Apply price filter
    if (priceFilter.min || priceFilter.max) {
      const minPrice = priceFilter.min ? parseInt(priceFilter.min.replace(/\D/g, '')) : undefined;
      const maxPrice = priceFilter.max ? parseInt(priceFilter.max.replace(/\D/g, '')) : undefined;
      filtered = Data4GService.filterPackagesByPrice(filtered, minPrice, maxPrice);
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
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
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

  const renderProviderItem = ({ item }: { item: { code: string; name: string } }) => (
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
        <Check size={20} color="#4CAF50" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const renderPackageItem = ({ item }: { item: DataPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        selectedPackage?.packageId === item.packageId && styles.packageItemSelected,
      ]}
      onPress={() => setSelectedPackage(item)}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{item.packageName}</Text>
        <Text style={styles.packagePrice}>{formatCurrency(item.price)}</Text>
      </View>
      
      <View style={styles.packageDetails}>
        <Text style={styles.packageData}>{item.formattedDataAmount}</Text>
        <Text style={styles.packageValidity}>
          {Data4GService.formatValidity(item.validityDays)}
        </Text>
      </View>
      
      <Text style={styles.packageDescription}>{item.description}</Text>
      
      {selectedPackage?.packageId === item.packageId && (
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

  const getSelectedProviderName = () => {
    const provider = providers.find(p => p.code === selectedProvider);
    return provider?.name || 'Chọn nhà mạng';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Nạp Data 4G" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Wifi size={24} color="#2196F3" />
          <Text style={styles.subtitle}>Nạp data 4G nhanh chóng cho thuê bao di động</Text>
        </View>

        {/* Recent Numbers */}
        {recentNumbers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số gần đây</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recentNumbers}>
                {recentNumbers.map(renderRecentNumber)}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại cần nạp data"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Nhà mạng</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowProviderModal(true)}
          >
            <Text style={[
              styles.selectorText,
              !selectedProvider && styles.selectorPlaceholder
            ]}>
              {getSelectedProviderName()}
            </Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Package Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <View style={styles.packageHeader}>
              <Text style={styles.label}>Gói data</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <Filter size={16} color="#2196F3" />
                <Text style={styles.filterText}>Lọc</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Đang tải gói data...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPackages}
                renderItem={renderPackageItem}
                keyExtractor={(item) => item.packageId.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Không có gói data nào</Text>
                }
              />
            )}
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!phoneNumber || !selectedProvider || !selectedPackage) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!phoneNumber || !selectedProvider || !selectedPackage}
        >
          <Text style={styles.confirmButtonText}>Xác nhận nạp data</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Provider Modal */}
      {showProviderModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn nhà mạng</Text>
            <FlatList
              data={providers}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.code}
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
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lọc gói data</Text>
            
            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Khoảng giá</Text>
              <View style={styles.priceFilterRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Từ"
                  value={priceFilter.min}
                  onChangeText={(text) => setPriceFilter(prev => ({ ...prev, min: text }))}
                  keyboardType="numeric"
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Đến"
                  value={priceFilter.max}
                  onChangeText={(text) => setPriceFilter(prev => ({ ...prev, max: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sắp xếp theo</Text>
              {[
                { key: 'price', label: 'Giá' },
                { key: 'dataAmount', label: 'Dung lượng' },
                { key: 'validityDays', label: 'Thời hạn' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                  {sortBy === option.key && (
                    <Check size={16} color="#2196F3" />
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
                <Text style={styles.filterResetText}>Đặt lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.filterApplyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
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
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectorPlaceholder: {
    color: '#999',
  },
  packageHeader: {
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
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
  },
  filterText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    padding: 20,
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
  packageItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  packageItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  packageDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  packageData: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 16,
  },
  packageValidity: {
    fontSize: 14,
    color: '#666',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    maxHeight: 300,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  providerItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  providerName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterResetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: 14,
    color: '#666',
  },
  filterApplyButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default Data4GScreen;