import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import SavingsCard from '../../components/savings/SavingsCard';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavingsHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo } = useSelector((state: RootState) => state.app);
  
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavingsAccounts = async () => {
    if (!userInfo?.id) return;

    try {
      const accounts = await SavingsService.getSavingsAccounts(userInfo.id.toString());
      setSavingsAccounts(accounts);
    } catch (error) {
      console.error('Error loading savings accounts:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách tài khoản tiết kiệm',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavingsAccounts();
    }, [userInfo?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSavingsAccounts();
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateSavingsAccount');
  };

  const handleViewRequests = () => {
    navigation.navigate('SavingsRequestList');
  };

  const handleAccountPress = (accountNumber: string) => {
    navigation.navigate('SavingsAccountDetail', { accountNumber });
  };

  const calculateTotalBalance = () => {
    // Only include active and matured accounts in total balance calculation
    // Exclude CLOSED accounts since they show closure time instead of balance
    return savingsAccounts
      .filter(account => account.status !== 'CLOSED')
      .reduce((total, account) => total + account.balance, 0);
  };

  const getActiveAccountsCount = () => {
    return savingsAccounts.filter(account => account.status !== 'CLOSED').length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Header title="Tài khoản tiết kiệm" showBackButton />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tổng quan */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tổng số dư tiết kiệm</Text>
          <Text style={styles.totalBalance}>
            {formatCurrency(calculateTotalBalance())}
          </Text>
          <Text style={styles.accountCount}>
            {getActiveAccountsCount()} tài khoản đang hoạt động
            {savingsAccounts.filter(acc => acc.status === 'CLOSED').length > 0 && 
              ` • ${savingsAccounts.filter(acc => acc.status === 'CLOSED').length} đã đóng`
            }
          </Text>
        </View>

        {/* Các nút chức năng */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateAccount}
          >
            <Text style={styles.actionButtonText}>Mở tài khoản mới</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleViewRequests}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Xem yêu cầu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách tài khoản */}
        <View style={styles.accountsContainer}>
          <Text style={styles.sectionTitle}>Tài khoản tiết kiệm của bạn</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : savingsAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Bạn chưa có tài khoản tiết kiệm nào
              </Text>
              <Text style={styles.emptySubText}>
                Hãy mở tài khoản đầu tiên để bắt đầu tiết kiệm
              </Text>
            </View>
          ) : (
            <>
              {/* Active and Matured Accounts */}
              {savingsAccounts
                .filter(account => account.status !== 'CLOSED')
                .map((account) => (
                  <SavingsCard
                    key={account.id}
                    account={account}
                    onPress={() => handleAccountPress(account.accountNumber)}
                  />
                ))}
              
              {/* Closed Accounts Section */}
              {savingsAccounts.filter(account => account.status === 'CLOSED').length > 0 && (
                <>
                  <View style={styles.closedAccountsHeader}>
                    <Text style={styles.closedAccountsTitle}>
                      Tài khoản đã đóng ({savingsAccounts.filter(acc => acc.status === 'CLOSED').length})
                    </Text>
                  </View>
                  {savingsAccounts
                    .filter(account => account.status === 'CLOSED')
                    .map((account) => (
                      <SavingsCard
                        key={account.id}
                        account={account}
                        onPress={() => handleAccountPress(account.accountNumber)}
                      />
                    ))}
                </>
              )}
            </>
          )}
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
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  accountCount: {
    fontSize: 14,
    color: '#999999',
  },
  actionContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
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
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1976D2',
  },
  accountsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  closedAccountsHeader: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closedAccountsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
});