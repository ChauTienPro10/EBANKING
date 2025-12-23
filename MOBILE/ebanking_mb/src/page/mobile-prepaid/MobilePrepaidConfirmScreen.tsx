import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CheckCircle, Smartphone, CreditCard } from 'lucide-react-native';

import MobilePrepaidService from '../../services/MobilePrepaidService';
import { MobileOperator, PrepaidPackage } from '../../services/MobilePrepaidService';
import PinModal from '../../components/PinModal';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MobilePrepaidConfirm'>;
type RoutePropType = RouteProp<RootStackParamList, 'MobilePrepaidConfirm'>;

interface RouteParams {
  phoneNumber: string;
  operator: MobileOperator;
  package: PrepaidPackage;
}

const MobilePrepaidConfirmScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { phoneNumber, operator, package: selectedPackage } = route.params;

  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleConfirm = () => {
    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setLoading(true);
      setShowPinModal(false);

      const request = {
        phoneNumber,
        operatorId: operator.id,
        packageId: selectedPackage.id,
        amount: selectedPackage.amount,
        pin,
      };

      const transaction = await MobilePrepaidService.topUpMobile(request);

      navigation.replace('MobilePrepaidResult', {
        transaction,
        operator,
        package: selectedPackage,
      });
    } catch (error) {
      console.error('Top-up error:', error);
      Alert.alert(
        t('mobile_prepaid.failed_title'),
        t('mobile_prepaid.failed_message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{t('mobile_prepaid.processing')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CheckCircle size={24} color="#4CAF50" />
          <Text style={styles.title}>{t('mobile_prepaid.confirm.title')}</Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Smartphone size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>{t('mobile_prepaid.title')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('mobile_prepaid.confirm.phone_label')}</Text>
            <Text style={styles.detailValue}>{phoneNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('mobile_prepaid.confirm.operator_label')}</Text>
            <View style={styles.operatorInfo}>
              <Image source={{ uri: operator.logo }} style={styles.operatorLogo} />
              <Text style={styles.detailValue}>{operator.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('mobile_prepaid.confirm.package_label')}</Text>
            <View>
              <Text style={styles.detailValue}>
                {formatCurrency(selectedPackage.amount)}
                {selectedPackage.bonus > 0 && (
                  <Text style={styles.bonusText}>
                    {' '}+{formatCurrency(selectedPackage.bonus)} KM
                  </Text>
                )}
              </Text>
              <Text style={styles.packageDescription}>{selectedPackage.description}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('mobile_prepaid.confirm.amount_label')}</Text>
            <Text style={styles.amountValue}>{formatCurrency(selectedPackage.amount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('mobile_prepaid.confirm.fee_label')}</Text>
            <Text style={styles.feeValue}>{t('mobile_prepaid.confirm.free_fee')}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>{t('mobile_prepaid.confirm.total_label')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(selectedPackage.amount)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>Tài khoản chính</Text>
            <Text style={styles.paymentMethodBalance}>Số dư: 50,000,000đ</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('mobile_prepaid.confirm.cancel_button')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>{t('mobile_prepaid.confirm.confirm_button')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        title={t('mobile_prepaid.confirm.enter_pin_title')}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  operatorLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  bonusText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  packageDescription: {
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
    color: '#2196F3',
    fontWeight: 'bold',
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
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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

export default MobilePrepaidConfirmScreen;