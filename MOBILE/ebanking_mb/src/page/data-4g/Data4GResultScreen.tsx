import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CheckCircle, Home, RotateCcw, XCircle, Clock } from 'lucide-react-native';

import { DataTopUpTransaction, DataPackage } from '../../services/Data4GService';
import Data4GService from '../../services/Data4GService';
import Header from '../../components/Header';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Data4GResult'>;
type RoutePropType = RouteProp<RootStackParamList, 'Data4GResult'>;

const Data4GResultScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { transaction, provider, package: selectedPackage } = route.params;

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
    navigation.navigate('Data4G' as never);
  };

  const isSuccess = transaction.status === 'COMPLETED';
  const isPending = transaction.status === 'PENDING';
  const isFailed = transaction.status === 'FAILED';

  const getHeaderTitle = () => {
    if (isSuccess) return 'Nạp data thành công';
    if (isPending) return 'Đang xử lý';
    return 'Nạp data thất bại';
  };

  const getProviderName = () => {
    const providerNames: Record<string, string> = {
      'VIETTEL': 'Viettel',
      'VINAPHONE': 'VinaPhone',
      'MOBIFONE': 'MobiFone',
      'VIETNAMOBILE': 'Vietnamobile',
    };
    return providerNames[provider] || provider;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={getHeaderTitle()} showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIcon, 
            isSuccess ? styles.successIcon : 
            isPending ? styles.pendingIcon : 
            styles.failureIcon
          ]}>
            {isSuccess ? (
              <CheckCircle size={48} color="#4CAF50" />
            ) : isPending ? (
              <Clock size={48} color="#FF9800" />
            ) : (
              <XCircle size={48} color="#F44336" />
            )}
          </View>
          <Text style={[
            styles.statusTitle, 
            isSuccess ? styles.successTitle : 
            isPending ? styles.pendingTitle : 
            styles.failureTitle
          ]}>
            {isSuccess ? 'Nạp data thành công' : 
             isPending ? 'Đang xử lý' : 
             'Nạp data thất bại'}
          </Text>
          <Text style={styles.statusMessage}>
            {isSuccess 
              ? `Đã nạp thành công gói ${selectedPackage.formattedDataAmount} cho số ${transaction.phoneNumber}`
              : isPending
              ? 'Giao dịch đang được xử lý, vui lòng chờ trong giây lát'
              : transaction.failureReason || 'Giao dịch không thành công, vui lòng thử lại'
            }
          </Text>
        </View>

        {/* Transaction Details */}
        {(isSuccess || isPending) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chi tiết giao dịch</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch</Text>
              <Text style={styles.detailValue}>{transaction.transactionId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số điện thoại</Text>
              <Text style={styles.detailValue}>{transaction.phoneNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nhà mạng</Text>
              <Text style={styles.detailValue}>{getProviderName()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gói data</Text>
              <View>
                <Text style={styles.detailValue}>{transaction.packageName}</Text>
                <Text style={styles.packageDetails}>
                  {transaction.formattedDataAmount} • {Data4GService.formatValidity(transaction.validityDays)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá trị</Text>
              <Text style={styles.amountValue}>{formatCurrency(transaction.amount)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái</Text>
              <Text style={[
                styles.statusValue,
                isSuccess ? styles.successStatus : 
                isPending ? styles.pendingStatus : 
                styles.failedStatus
              ]}>
                {isSuccess ? 'Thành công' : 
                 isPending ? 'Đang xử lý' : 
                 'Thất bại'}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian tạo</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(transaction.createdAt)}
              </Text>
            </View>

            {transaction.completedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian hoàn thành</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(transaction.completedAt)}
                </Text>
              </View>
            )}

            {transaction.providerTransactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã GD nhà mạng</Text>
                <Text style={styles.detailValue}>{transaction.providerTransactionId}</Text>
              </View>
            )}
          </View>
        )}

        {/* Success Tips */}
        {isSuccess && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Lưu ý</Text>
            <Text style={styles.tipsText}>
              • Data đã được nạp vào thuê bao thành công{'\n'}
              • Kiểm tra dung lượng data bằng cách gọi *101#{'\n'}
              • Data có hiệu lực trong {Data4GService.formatValidity(transaction.validityDays)}{'\n'}
              • Lưu lại mã giao dịch để tra cứu sau này
            </Text>
          </View>
        )}

        {/* Pending Info */}
        {isPending && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingCardTitle}>⏳ Đang xử lý</Text>
            <Text style={styles.pendingText}>
              Giao dịch của bạn đang được xử lý. Data sẽ được nạp vào thuê bao trong vài phút tới.
            </Text>
          </View>
        )}

        {/* Face Auth Required */}
        {transaction.requiresFaceAuth && !transaction.faceAuthVerified && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>🔐 Yêu cầu xác thực</Text>
            <Text style={styles.warningText}>
              Giao dịch này yêu cầu xác thực khuôn mặt. Vui lòng hoàn thành xác thực để tiếp tục.
            </Text>
          </View>
        )}

        {/* Data Usage Tips */}
        {isSuccess && (
          <View style={styles.usageCard}>
            <Text style={styles.usageTitle}>📱 Cách sử dụng data hiệu quả</Text>
            <View style={styles.usageTip}>
              <Text style={styles.usageTipIcon}>💡</Text>
              <Text style={styles.usageTipText}>
                Tắt tự động cập nhật ứng dụng khi không dùng WiFi
              </Text>
            </View>
            <View style={styles.usageTip}>
              <Text style={styles.usageTipIcon}>📊</Text>
              <Text style={styles.usageTipText}>
                Theo dõi lưu lượng data trong Cài đặt điện thoại
              </Text>
            </View>
            <View style={styles.usageTip}>
              <Text style={styles.usageTipIcon}>🔄</Text>
              <Text style={styles.usageTipText}>
                Sử dụng WiFi khi có thể để tiết kiệm data 4G
              </Text>
            </View>
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
            <Text style={styles.primaryButtonText}>Nạp data khác</Text>
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
  pendingIcon: {
    backgroundColor: '#fff3e0',
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
  pendingTitle: {
    color: '#FF9800',
  },
  failureTitle: {
    color: '#F44336',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
  packageDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  amountValue: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  successStatus: {
    color: '#4CAF50',
  },
  pendingStatus: {
    color: '#FF9800',
  },
  failedStatus: {
    color: '#F44336',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  tipsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  pendingCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  pendingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#c62828',
    lineHeight: 20,
  },
  usageCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  usageTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  usageTipIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  usageTipText: {
    fontSize: 14,
    color: '#2e7d32',
    flex: 1,
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

export default Data4GResultScreen;