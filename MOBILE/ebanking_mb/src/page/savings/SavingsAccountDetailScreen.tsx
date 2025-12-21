import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<RootStackParamList, 'SavingsAccountDetail'>;

export default function SavingsAccountDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { accountNumber } = route.params;
  
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccountDetail = async () => {
    try {
      const accountData = await SavingsService.getSavingsAccountDetail(accountNumber);
      setAccount(accountData);
    } catch (error) {
      console.error('Error loading account detail:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải thông tin tài khoản',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccountDetail();
    }, [accountNumber])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAccountDetail();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'MATURED':
        return '#FF9800';
      case 'CLOSED':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'MATURED':
        return 'Đã đến hạn';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const handleTransferToSavings = () => {
    navigation.navigate('SavingsTransfer', {
      accountNumber,
      type: 'TO_SAVINGS',
    });
  };

  const handleTransferFromSavings = () => {
    navigation.navigate('SavingsTransfer', {
      accountNumber,
      type: 'FROM_SAVINGS',
    });
  };

  const handleDepositRequest = () => {
    navigation.navigate('CreateSavingsRequest', {
      accountNumber,
      type: 'DEPOSIT',
    });
  };

  const handleWithdrawRequest = () => {
    navigation.navigate('CreateSavingsRequest', {
      accountNumber,
      type: 'WITHDRAW',
    });
  };

  const calculateDaysToMaturity = () => {
    if (!account) return 0;
    const maturityDate = new Date(account.maturityDate);
    const today = new Date();
    const diffTime = maturityDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateEstimatedInterest = () => {
    if (!account) return 0;
    const principal = account.balance;
    const rate = account.interestRate / 100;
    const timeInYears = account.termMonths / 12;
    return principal * rate * timeInYears;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết tài khoản" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết tài khoản" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin tài khoản</Text>
        </View>
      </View>
    );
  }

  const daysToMaturity = calculateDaysToMaturity();
  const estimatedInterest = calculateEstimatedInterest();

  return (
    <View style={styles.container}>
      <Header title="Chi tiết tài khoản" showBackButton />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Thông tin tài khoản */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <Text style={styles.accountName}>
              {account.accountName || `Tài khoản tiết kiệm ${account.termMonths} tháng`}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(account.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(account.status)}</Text>
            </View>
          </View>

          <Text style={styles.accountNumber}>STK: {account.accountNumber}</Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lãi suất</Text>
              <Text style={styles.detailValue}>{account.interestRate}%/năm</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kỳ hạn</Text>
              <Text style={styles.detailValue}>{account.termMonths} tháng</Text>
            </View>
          </View>
        </View>

        {/* Thông tin kỳ hạn */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin kỳ hạn</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày mở tài khoản:</Text>
            <Text style={styles.infoValue}>{formatDate(account.openDate)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đến hạn:</Text>
            <Text style={styles.infoValue}>{formatDate(account.maturityDate)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số ngày còn lại:</Text>
            <Text style={[styles.infoValue, { color: daysToMaturity > 0 ? '#2E7D32' : '#D32F2F' }]}>
              {daysToMaturity > 0 ? `${daysToMaturity} ngày` : 'Đã đến hạn'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tự động gia hạn:</Text>
            <Text style={styles.infoValue}>
              {account.autoRenewal !== undefined ? (account.autoRenewal ? 'Có' : 'Không') : 'Không'}
            </Text>
          </View>

          {account.totalInterestEarned !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tổng lãi đã nhận:</Text>
              <Text style={[styles.infoValue, { color: '#2E7D32' }]}>
                {formatCurrency(account.totalInterestEarned)}
              </Text>
            </View>
          )}

          {account.currency && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Đơn vị tiền tệ:</Text>
              <Text style={styles.infoValue}>{account.currency}</Text>
            </View>
          )}
        </View>

        {/* Ước tính lãi */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Ước tính lãi suất</Text>
          
          <View style={styles.interestContainer}>
            <Text style={styles.interestLabel}>Lãi dự kiến khi đến hạn</Text>
            <Text style={styles.interestValue}>
              {formatCurrency(estimatedInterest)}
            </Text>
          </View>
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng tiền nhận được</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(account.balance + estimatedInterest)}
            </Text>
          </View>
        </View>

        {/* Tài khoản liên kết */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Tài khoản liên kết</Text>
          <Text style={styles.linkedAccount}>{account.linkedTransactionAccount}</Text>
          <Text style={styles.linkedAccountLabel}>Tài khoản giao dịch chính</Text>
        </View>

        {/* Các nút chức năng */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Giao dịch</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTransferToSavings}
            >
              <Text style={styles.actionButtonText}>Nạp từ TK giao dịch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleTransferFromSavings}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Chuyển về TK giao dịch
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton]}
              onPress={handleDepositRequest}
            >
              <Text style={[styles.actionButtonText, styles.tertiaryButtonText]}>
                Yêu cầu nạp tiền mặt
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton]}
              onPress={handleWithdrawRequest}
            >
              <Text style={[styles.actionButtonText, styles.tertiaryButtonText]}>
                Yêu cầu rút tiền mặt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  accountCard: {
    backgroundColor: '#1976D2',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 16,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#E8EAF6',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  interestContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  interestLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  interestValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  totalContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  linkedAccount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  linkedAccountLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1976D2',
  },
  tertiaryButtonText: {
    color: '#FF9800',
  },
});