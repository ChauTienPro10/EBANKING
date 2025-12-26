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
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import SavingsCard from '../../components/savings/SavingsCard';
import Header from '../../components/Header';
import Colors from '../../constants/color';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AllSavingsAccountsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { userInfoData: userInfo } = useSelector(
    (state: RootState) => state.app,
  );

  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        text1: t('savings.error_title'),
        text2: t('savings.error_load_accounts'),
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

  const handleAccountPress = (accountNumber: string) => {
    navigation.navigate('SavingsAccountDetail', { accountNumber });
  };

  const calculateTotalBalance = () => {
    return savingsAccounts
      .filter(account => account.status !== 'CLOSED')
      .reduce((total, account) => total + account.balance, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Header title={t('savings.all_accounts_title')} showBackButton />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tổng quan */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>{t('savings.total_balance')}</Text>
          <Text style={styles.totalBalance}>
            {formatCurrency(calculateTotalBalance())}
          </Text>
          <Text style={styles.accountCount}>
            {savingsAccounts.filter(acc => acc.status !== 'CLOSED').length}{' '}
            {t('savings.active_accounts')}
            {savingsAccounts.filter(acc => acc.status === 'CLOSED').length >
              0 &&
              ` • ${
                savingsAccounts.filter(acc => acc.status === 'CLOSED').length
              } ${t('savings.closed_accounts')}`}
          </Text>
        </View>

        {/* Danh sách tài khoản */}
        <View style={styles.accountsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('savings.loading')}</Text>
            </View>
          ) : savingsAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('savings.no_accounts')}</Text>
              <Text style={styles.emptySubText}>
                {t('savings.no_accounts_subtitle')}
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
                      {t('savings.closed_accounts_section')} (
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
