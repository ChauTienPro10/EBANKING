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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import { useEkycValidation } from '../../utils/useEkycValidation';
import SavingsCard from '../../components/savings/SavingsCard';
import Header from '../../components/Header';
import ConfirmModal from '../../components/ConfirmModal';
import Colors from '../../constants/color';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavingsHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo } = useSelector(
    (state: RootState) => state.app,
  );
  const { validateEkyc } = useEkycValidation();

  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const loadSavingsAccounts = async () => {
    if (!userInfo?.id) return;

    try {
      const accounts = await SavingsService.getSavingsAccounts(
        userInfo.id.toString(),
      );
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
    }, [userInfo?.id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSavingsAccounts();
  };

  const handleCreateAccount = () => {
    // Validate eKYC before allowing account creation
    const ekycValidation = validateEkyc(
      (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
        setShowEKYCModal(true);
      },
    );

    if (!ekycValidation.isValid) {
      return;
    }

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
    return savingsAccounts.filter(account => account.status !== 'CLOSED')
      .length;
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
            {savingsAccounts.filter(acc => acc.status === 'CLOSED').length >
              0 &&
              ` • ${
                savingsAccounts.filter(acc => acc.status === 'CLOSED').length
              } đã đóng`}
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
                .map(account => (
                  <SavingsCard
                    key={account.id}
                    account={account}
                    onPress={() => handleAccountPress(account.accountNumber)}
                  />
                ))}

              {/* Closed Accounts Section */}
              {savingsAccounts.filter(account => account.status === 'CLOSED')
                .length > 0 && (
                <>
                  <View style={styles.closedAccountsHeader}>
                    <Text style={styles.closedAccountsTitle}>
                      Tài khoản đã đóng (
                      {
                        savingsAccounts.filter(acc => acc.status === 'CLOSED')
                          .length
                      }
                      )
                    </Text>
                  </View>
                  {savingsAccounts
                    .filter(account => account.status === 'CLOSED')
                    .map(account => (
                      <SavingsCard
                        key={account.id}
                        account={account}
                        onPress={() =>
                          handleAccountPress(account.accountNumber)
                        }
                      />
                    ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* eKYC Modal */}
      <ConfirmModal
        visible={showEKYCModal}
        title="⚠️ Yêu cầu xác thực eKYC"
        message="Tính năng tiết kiệm yêu cầu xác thực eKYC. Vui lòng hoàn thành xác thực để tiếp tục."
        confirmText="Xác thực ngay"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          setShowEKYCModal(false);
          navigation.navigate('EKYC');
        }}
        onCancel={() => setShowEKYCModal(false)}
        confirmButtonStyle={{ backgroundColor: Colors.main_bule }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.main_bule,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  accountCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.main_bule,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.main_bule,
  },
  accountsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  closedAccountsHeader: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closedAccountsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
