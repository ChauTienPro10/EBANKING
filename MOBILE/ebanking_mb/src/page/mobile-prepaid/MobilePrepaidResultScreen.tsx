import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CheckCircle, Home, RotateCcw } from 'lucide-react-native';

import { PrepaidTransaction, MobileOperator, PrepaidPackage } from '../../services/MobilePrepaidService';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MobilePrepaidResult'>;
type RoutePropType = RouteProp<RootStackParamList, 'MobilePrepaidResult'>;

interface RouteParams {
  transaction: PrepaidTransaction;
  operator: MobileOperator;
  package: PrepaidPackage;
}

const MobilePrepaidResultScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { transaction, operator, package: selectedPackage } = route.params;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  const handleTopUpAgain = () => {
    navigation.navigate('MobilePrepaid' as never);
  };

  const isSuccess = transaction.status === 'success';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIcon, isSuccess ? styles.successIcon : styles.failureIcon]}>
            <CheckCircle size={48} color={isSuccess ? '#4CAF50' : '#F44336'} />
          </View>
          <Text style={[styles.statusTitle, isSuccess ? styles.successTitle : styles.failureTitle]}>
            {isSuccess ? t('mobile_prepaid.success_title') : t('mobile_prepaid.failed_title')}
          </Text>
          <Text style={styles.statusMessage}>
            {isSuccess 
              ? t('mobile_prepaid.success_message', { 
                  amount: formatCurrency(transaction.amount), 
                  phone: transaction.phoneNumber 
                })
              : t('mobile_prepaid.failed_message')
            }
          </Text>
        </View>

        {/* Transaction Details */}
        {isSuccess && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chi tiết giao dịch</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('mobile_prepaid.transaction_id')}</Text>
              <Text style={styles.detailValue}>{transaction.transactionId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số điện thoại</Text>
              <Text style={styles.detailValue}>{transaction.phoneNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nhà mạng</Text>
              <View style={styles.operatorInfo}>
                <Image source={{ uri: operator.logo }} style={styles.operatorLogo} />
                <Text style={styles.detailValue}>{operator.name}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gói nạp</Text>
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
              <Text style={styles.detailLabel}>Số tiền</Text>
              <Text style={styles.amountValue}>{formatCurrency(transaction.amount)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('mobile_prepaid.completed_at')}</Text>
              <Text style={styles.detailValue}>
                {transaction.completedAt ? formatDateTime(transaction.completedAt) : '-'}
              </Text>
            </View>
          </View>
        )}

        {/* Success Tips */}
        {isSuccess && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Lưu ý</Text>
            <Text style={styles.tipsText}>
              • Tiền đã được nạp vào thuê bao thành công{'\n'}
              • Kiểm tra số dư bằng cách gọi *101#{'\n'}
              • Lưu lại mã giao dịch để tra cứu sau này
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
            <Home size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleTopUpAgain}>
            <RotateCcw size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Nạp tiền khác</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: '#e8f5e8',
  },
  failureIcon: {
    backgroundColor: '#ffebee',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successTitle: {
    color: '#4CAF50',
  },
  failureTitle: {
    color: '#F44336',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MobilePrepaidResultScreen;