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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { SavingsService } from '../../services/SavingsService';
import { SavingsAccount } from '../../types/SavingsTypes';
import { useEkycValidation } from '../../utils/useEkycValidation';
import Header from '../../components/Header';
import ConfirmModal from '../../components/ConfirmModal';
import Colors from '../../constants/color';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<
  RootStackParamList,
  'SavingsAccountDetail'
>;

export default function SavingsAccountDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { accountNumber } = route.params;
  const { validateEkyc } = useEkycValidation();
  const { t } = useTranslation();

  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const getTermName = (months: number) => {
    const key = `term_name_${months}` as const;
    return t(`savings.${key}`, {
      defaultValue: `${t('savings.savings_term')} ${months} ${t(
        'savings.months',
      )}`,
    });
  };

  const getDisplayName = (
    accountName: string | null | undefined,
    termMonths: number,
  ) => {
    if (
      !accountName ||
      accountName.includes('Tài khoản tiết kiệm') ||
      accountName.includes('Tiết kiệm')
    ) {
      return getTermName(termMonths);
    }
    return accountName;
  };

  const loadAccountDetail = async () => {
    try {
      const accountData = await SavingsService.getSavingsAccountDetail(
        accountNumber,
      );
      setAccount(accountData);
    } catch (error) {
      console.error('Error loading account detail:', error);
      Toast.show({
        type: 'error',
        text1: t('savings.error_title'),
        text2: t('savings.error_load_account_detail'),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccountDetail();
    }, [accountNumber]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAccountDetail();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: '#10B981',
          bgColor: '#ECFDF5',
          text: t('savings.status_active'),
        };
      case 'MATURED':
        return {
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          text: t('savings.status_matured'),
        };
      case 'CLOSED':
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          text: t('savings.status_closed'),
        };
      default:
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          text: status,
        };
    }
  };

  const handleTransferToSavings = () => {
    // Validate eKYC for high-value transactions
    const ekycValidation = validateEkyc(
      (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
        setShowEKYCModal(true);
      },
    );

    if (!ekycValidation.isValid) {
      return;
    }

    navigation.navigate('SavingsTransfer', {
      accountNumber,
      type: 'TO_SAVINGS',
    });
  };

  const handleTransferFromSavings = () => {
    // Validate eKYC for high-value transactions
    const ekycValidation = validateEkyc(
      (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
        setShowEKYCModal(true);
      },
    );

    if (!ekycValidation.isValid) {
      return;
    }

    navigation.navigate('SavingsTransfer', {
      accountNumber,
      type: 'FROM_SAVINGS',
    });
  };

  const handleDepositRequest = () => {
    // Validate eKYC for cash transactions
    const ekycValidation = validateEkyc(
      (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
        setShowEKYCModal(true);
      },
    );

    if (!ekycValidation.isValid) {
      return;
    }

    navigation.navigate('CreateSavingsRequest', {
      accountNumber,
      type: 'DEPOSIT',
    });
  };

  const handleWithdrawRequest = () => {
    // Validate eKYC for cash transactions
    const ekycValidation = validateEkyc(
      (reason: 'NOT_VERIFIED' | 'EXPIRED') => {
        setShowEKYCModal(true);
      },
    );

    if (!ekycValidation.isValid) {
      return;
    }

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
    const rate = account.interestRate; // Already in decimal format (e.g., 0.042 for 4.2%)
    const timeInYears = account.termMonths / 12;
    return principal * rate * timeInYears;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết tài khoản" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
          <Text style={styles.loadingText}>{t('savings.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết tài khoản" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('savings.error_account_not_found')}
          </Text>
        </View>
      </View>
    );
  }

  const daysToMaturity = calculateDaysToMaturity();
  const estimatedInterest = calculateEstimatedInterest();

  return (
    <View style={styles.container}>
      <Header title={t('savings.account_detail_title')} showBackButton />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Thông tin tài khoản */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="wallet" size={24} color={Colors.main_bule} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.accountName}>
                  {getDisplayName(account.accountName, account.termMonths)}
                </Text>
                <Text style={styles.accountNumber}>
                  {account.accountNumber}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusConfig(account.status).bgColor },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusConfig(account.status).color },
                ]}
              >
                {getStatusConfig(account.status).text}
              </Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>
              {t('savings.current_balance')}
            </Text>
            <Text style={styles.balance}>
              {formatCurrency(account.balance)}{' '}
              <Text style={styles.currency}>₫</Text>
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailCard}>
              <Ionicons name="trending-up" size={16} color={Colors.main_bule} />
              <Text style={styles.detailLabel}>
                {t('savings.interest_rate')}
              </Text>
              <Text style={styles.detailValue}>
                {(account.interestRate * 100).toFixed(2)}%/năm
              </Text>
            </View>
            <View style={styles.detailCard}>
              <Ionicons name="calendar" size={16} color={Colors.main_bule} />
              <Text style={styles.detailLabel}>{t('savings.term')}</Text>
              <Text style={styles.detailValue}>
                {account.termMonths} {t('savings.months')}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin kỳ hạn */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('savings.term_info')}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.open_date')}:</Text>
            <Text style={styles.infoValue}>{formatDate(account.openDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.maturity_date')}:</Text>
            <Text style={styles.infoValue}>
              {formatDate(account.maturityDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.days_remaining')}:</Text>
            <Text
              style={[
                styles.infoValue,
                { color: daysToMaturity > 0 ? '#10B981' : '#EF4444' },
              ]}
            >
              {daysToMaturity > 0
                ? `${daysToMaturity} ${t('savings.days')}`
                : t('savings.matured')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.auto_renewal')}:</Text>
            <Text style={styles.infoValue}>
              {account.autoRenewal !== undefined
                ? account.autoRenewal
                  ? t('savings.yes')
                  : t('savings.no')
                : t('savings.no')}
            </Text>
          </View>

          {account.totalInterestEarned !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('savings.total_interest_earned')}:
              </Text>
              <Text style={[styles.infoValue, { color: '#10B981' }]}>
                {formatCurrency(account.totalInterestEarned)} ₫
              </Text>
            </View>
          )}

          {account.currency && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('savings.currency_unit')}:
              </Text>
              <Text style={styles.infoValue}>{account.currency}</Text>
            </View>
          )}
        </View>

        {/* Ước tính lãi */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            {t('savings.interest_estimation')}
          </Text>

          <View style={styles.interestContainer}>
            <Text style={styles.interestLabel}>
              {t('savings.estimated_interest')}
            </Text>
            <Text style={styles.interestValue}>
              {formatCurrency(estimatedInterest)} ₫
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('savings.total_amount')}</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(account.balance + estimatedInterest)} ₫
            </Text>
          </View>
        </View>

        {/* Tài khoản liên kết */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('savings.linked_account')}</Text>
          <Text style={styles.linkedAccount}>
            {account.linkedTransactionAccount}
          </Text>
          <Text style={styles.linkedAccountLabel}>
            {t('savings.main_transaction_account')}
          </Text>
        </View>

        {/* Các nút chức năng */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>{t('savings.transactions')}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTransferToSavings}
            >
              <Text style={styles.actionButtonText}>
                {t('savings.deposit_from_payment')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleTransferFromSavings}
            >
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                {t('savings.transfer_to_payment')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton]}
              onPress={handleDepositRequest}
            >
              <Text
                style={[styles.actionButtonText, styles.tertiaryButtonText]}
              >
                {t('savings.cash_deposit_request')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton]}
              onPress={handleWithdrawRequest}
            >
              <Text
                style={[styles.actionButtonText, styles.tertiaryButtonText]}
              >
                {t('savings.cash_withdraw_request')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* eKYC Modal */}
      <ConfirmModal
        visible={showEKYCModal}
        title={t('savings.ekyc_required_title')}
        message={t('savings.ekyc_transaction_message')}
        confirmText={t('savings.verify_now')}
        cancelText={t('savings.cancel')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  accountCard: {
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${Colors.main_bule}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  balanceContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  interestContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  interestLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  interestValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  totalContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.main_bule,
  },
  linkedAccount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  linkedAccountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
  tertiaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.main_bule,
  },
  tertiaryButtonText: {
    color: '#F59E0B',
  },
});
