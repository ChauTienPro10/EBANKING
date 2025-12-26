import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { CheckCircle, Wifi, CreditCard } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Data4GService, { DataPackage } from '../../services/Data4GService';
import PinModal from '../../components/PinModal';
import Header from '../../components/Header';
import Colors from '../../constants/color';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import {
  translatePackageName,
  translatePackageDescription,
  translateValidity,
} from '../../utils/translationHelpers';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Data4GConfirm'
>;
type RoutePropType = RouteProp<RootStackParamList, 'Data4GConfirm'>;

const Data4GConfirmScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { phoneNumber, provider, package: selectedPackage } = route.params;
  const {
    userInfoData: userInfo,
    accountTransResponse,
    loginResponse,
  } = useSelector((state: RootState) => state.app);

  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleConfirm = () => {
    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (
      !userInfo?.id ||
      !loginResponse?.username ||
      !accountTransResponse?.accountNumber
    ) {
      Alert.alert('Lỗi', 'Thông tin tài khoản không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setShowPinModal(false);

      const request = {
        userId: userInfo.id,
        username: loginResponse.username,
        accountNumber: accountTransResponse.accountNumber,
        phoneNumber,
        packageId: selectedPackage.packageId,
        pin,
      };

      const transaction = await Data4GService.initiateDataTopUp(request);

      navigation.replace('Data4GResult', {
        transaction,
        provider,
        package: selectedPackage,
      });
    } catch (error: any) {
      console.error('Data top-up error:', error);
      Alert.alert(
        'Nạp data thất bại',
        error.message || 'Không thể nạp data. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getProviderName = () => {
    const providerNames: Record<string, string> = {
      VIETTEL: 'Viettel',
      VINAPHONE: 'VinaPhone',
      MOBIFONE: 'MobiFone',
      VIETNAMOBILE: 'Vietnamobile',
    };
    return providerNames[provider] || provider;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title={t('data_4g.confirm_title')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09a0a5" />
          <Text style={styles.loadingText}>{t('data_4g.processing')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title={t('data_4g.confirm_title')} showBackButton />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CheckCircle size={24} color="#4CAF50" />
          <Text style={styles.headerText}>{t('data_4g.confirm_info')}</Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wifi size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>{t('data_4g.title')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('data_4g.phone_number')}</Text>
            <Text style={styles.detailValue}>{phoneNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('data_4g.provider')}</Text>
            <Text style={styles.detailValue}>{getProviderName()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('data_4g.package')}</Text>
            <View>
              <Text style={styles.detailValue}>
                {translatePackageName(selectedPackage.packageName)}
              </Text>
              <Text style={styles.packageDetails}>
                {selectedPackage.formattedDataAmount} •{' '}
                {translateValidity(
                  Data4GService.formatValidity(selectedPackage.validityDays),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('data_4g.description')}</Text>
            <Text style={styles.detailValue}>
              {translatePackageDescription(selectedPackage.description)}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('data_4g.price')}</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(selectedPackage.price)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('data_4g.transaction_fee')}
            </Text>
            <Text style={styles.feeValue}>{t('data_4g.free')}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>{t('data_4g.total')}</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(selectedPackage.price)}
            </Text>
          </View>
        </View>

        {/* Package Benefits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('data_4g.benefits_title')}</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="cellular" size={22} color="#059669" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t('data_4g.benefit_data')}
              </Text>
              <Text style={styles.benefitDescription}>
                {t('data_4g.benefit_data_desc', {
                  amount: selectedPackage.formattedDataAmount,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="time-outline" size={22} color="#F59E0B" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t('data_4g.benefit_validity')}
              </Text>
              <Text style={styles.benefitDescription}>
                {translateValidity(
                  Data4GService.formatValidity(selectedPackage.validityDays),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="flash" size={22} color="#8B5CF6" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t('data_4g.benefit_speed')}
              </Text>
              <Text style={styles.benefitDescription}>
                {t('data_4g.benefit_speed_desc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={20} color="#09a0a5" />
            <Text style={styles.cardTitle}>{t('data_4g.payment_method')}</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>
              {t('data_4g.primary_account')}
            </Text>
            <Text style={styles.paymentMethodBalance}>
              {t('data_4g.account_number')}:{' '}
              {accountTransResponse?.accountNumber || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('data_4g.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {t('data_4g.confirm_button')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        title="Nhập mã PIN"
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPinModal(false)}
      />
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
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  packageDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  amountValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#09a0a5',
    fontWeight: 'bold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentMethodBalance: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'column',
    marginTop: 24,
    marginBottom: 32,
    gap: 14,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#6B7280',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#09a0a5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#09a0a5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default Data4GConfirmScreen;
