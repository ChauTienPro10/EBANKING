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
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MobilePrepaidService, {
  MobileOperator,
} from '../../services/MobilePrepaidService';
import PinModal from '../../components/PinModal';
import Header from '../../components/Header';
import Colors from '../../constants/color';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MobilePrepaidConfirm'
>;
type RoutePropType = RouteProp<RootStackParamList, 'MobilePrepaidConfirm'>;

const MobilePrepaidConfirmScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { phoneNumber, operator, amount, fee, totalAmount } = route.params;
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
        telecomProvider: operator.providerCode,
        amount,
        pin,
      };

      const transaction = await MobilePrepaidService.topUpMobile(request);

      navigation.replace('MobilePrepaidResult', {
        transaction,
        operator,
        amount,
      });
    } catch (error: any) {
      console.error('Top-up error:', error);
      Alert.alert(
        t('mobile_prepaid.failed_title'),
        error.message || t('mobile_prepaid.failed_message'),
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
      <View style={styles.container}>
        <Header title={t('mobile_prepaid.confirm.title')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
          <Text style={styles.loadingText}>
            {t('mobile_prepaid.processing')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title={t('mobile_prepaid.confirm.title')} showBackButton />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={Colors.main_bule}
            />
            <Text style={styles.cardTitle}>{t('mobile_prepaid.title')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('mobile_prepaid.confirm.phone_label')}
            </Text>
            <Text style={styles.detailValue}>{phoneNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('mobile_prepaid.confirm.operator_label')}
            </Text>
            <View style={styles.operatorInfo}>
              <Image
                source={{ uri: operator.logoUrl }}
                style={styles.operatorLogo}
              />
              <Text style={styles.detailValue}>{operator.providerName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('mobile_prepaid.confirm.amount_label')}
            </Text>
            <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền nạp:</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phí giao dịch:</Text>
            <Text style={styles.feeValue}>{formatCurrency(fee)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>
              {t('mobile_prepaid.confirm.total_label')}
            </Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color={Colors.main_bule} />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>Tài khoản chính</Text>
            <Text style={styles.paymentMethodBalance}>
              STK: {accountTransResponse?.accountNumber || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>
              {t('mobile_prepaid.confirm.cancel_button')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {t('mobile_prepaid.confirm.confirm_button')}
            </Text>
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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
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
    color: Colors.main_bule,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 0.3,
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
