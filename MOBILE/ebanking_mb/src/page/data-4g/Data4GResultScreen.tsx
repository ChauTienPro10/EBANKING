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
import {
  CheckCircle,
  Home,
  RotateCcw,
  XCircle,
  Clock,
} from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  DataTopUpTransaction,
  DataPackage,
} from '../../services/Data4GService';
import Data4GService from '../../services/Data4GService';
import Header from '../../components/Header';
import { RootStackParamList } from '../../navigation/types';
import {
  translatePackageName,
  translateValidity,
} from '../../utils/translationHelpers';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Data4GResult'
>;
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
    if (isSuccess) return t('data_4g.success_title');
    if (isPending) return t('data_4g.status_pending');
    return t('data_4g.failed_title');
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title={getHeaderTitle()} showBackButton />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIcon,
              isSuccess
                ? styles.successIcon
                : isPending
                ? styles.pendingIcon
                : styles.failureIcon,
            ]}
          >
            {isSuccess ? (
              <CheckCircle size={48} color="#4CAF50" />
            ) : isPending ? (
              <Clock size={48} color="#FF9800" />
            ) : (
              <XCircle size={48} color="#F44336" />
            )}
          </View>
          <Text
            style={[
              styles.statusTitle,
              isSuccess
                ? styles.successTitle
                : isPending
                ? styles.pendingTitle
                : styles.failureTitle,
            ]}
          >
            {isSuccess
              ? t('data_4g.success_title')
              : isPending
              ? t('data_4g.status_pending')
              : t('data_4g.failed_title')}
          </Text>
          <Text style={styles.statusMessage}>
            {isSuccess
              ? t('data_4g.success_message', {
                  package: selectedPackage.formattedDataAmount,
                  phone: transaction.phoneNumber,
                })
              : isPending
              ? t('mobile_prepaid.result.pending_message')
              : transaction.failureReason || t('data_4g.failed_message')}
          </Text>
        </View>

        {/* Transaction Details */}
        {(isSuccess || isPending) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('data_4g.transaction_details')}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('data_4g.transaction_id')}
              </Text>
              <Text style={styles.detailValue}>
                {transaction.transactionId}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('data_4g.phone_number')}
              </Text>
              <Text style={styles.detailValue}>{transaction.phoneNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('data_4g.provider')}</Text>
              <Text style={styles.detailValue}>{getProviderName()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('data_4g.package')}</Text>
              <View>
                <Text style={styles.detailValue}>
                  {translatePackageName(transaction.packageName)}
                </Text>
                <Text style={styles.packageDetails}>
                  {transaction.formattedDataAmount} •{' '}
                  {translateValidity(
                    Data4GService.formatValidity(transaction.validityDays),
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('data_4g.price')}</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(transaction.amount)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('data_4g.status')}</Text>
              <Text
                style={[
                  styles.statusValue,
                  isSuccess
                    ? styles.successStatus
                    : isPending
                    ? styles.pendingStatus
                    : styles.failedStatus,
                ]}
              >
                {isSuccess
                  ? t('data_4g.status_completed')
                  : isPending
                  ? t('data_4g.status_pending')
                  : t('data_4g.status_failed')}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('mobile_prepaid.result.created_at_label')}
              </Text>
              <Text style={styles.detailValue}>
                {formatDateTime(transaction.createdAt)}
              </Text>
            </View>

            {transaction.completedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('mobile_prepaid.result.completed_at_label')}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(transaction.completedAt)}
                </Text>
              </View>
            )}

            {transaction.providerTransactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('mobile_prepaid.result.provider_transaction_id_label')}
                </Text>
                <Text style={styles.detailValue}>
                  {transaction.providerTransactionId}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Success Tips */}
        {isSuccess && (
          <View style={styles.tipsCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="bulb-outline" size={20} color="#09a0a5" />
              </View>
              <Text style={styles.tipsTitle}>
                {t('mobile_prepaid.result.tips_title')}
              </Text>
            </View>
            <Text style={styles.tipsText}>
              {t('data_4g.result_tips_text', {
                validity: translateValidity(
                  Data4GService.formatValidity(transaction.validityDays),
                ),
              })}
            </Text>
          </View>
        )}

        {/* Pending Info */}
        {isPending && (
          <View style={styles.pendingCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#FF9800" />
              </View>
              <Text style={styles.pendingCardTitle}>
                {t('mobile_prepaid.result.pending_card_title')}
              </Text>
            </View>
            <Text style={styles.pendingText}>
              {t('data_4g.result_pending_text')}
            </Text>
          </View>
        )}

        {/* Face Auth Required */}
        {transaction.requiresFaceAuth && !transaction.faceAuthVerified && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {t('mobile_prepaid.result.auth_required_title')}
            </Text>
            <Text style={styles.warningText}>
              {t('mobile_prepaid.result.auth_required_text')}
            </Text>
          </View>
        )}

        {/* Data Usage Tips */}
        {isSuccess && (
          <View style={styles.usageCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="#09a0a5"
                />
              </View>
              <Text style={styles.usageTitle}>
                {t('data_4g.usage_tips_title')}
              </Text>
            </View>
            <View style={styles.usageTip}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#09a0a5"
                style={styles.usageTipIcon}
              />
              <Text style={styles.usageTipText}>
                {t('data_4g.usage_tip_1')}
              </Text>
            </View>
            <View style={styles.usageTip}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#09a0a5"
                style={styles.usageTipIcon}
              />
              <Text style={styles.usageTipText}>
                {t('data_4g.usage_tip_2')}
              </Text>
            </View>
            <View style={styles.usageTip}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#09a0a5"
                style={styles.usageTipIcon}
              />
              <Text style={styles.usageTipText}>
                {t('data_4g.usage_tip_3')}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
          >
            <Home size={20} color="#09a0a5" />
            <Text style={styles.secondaryButtonText}>
              {t('data_4g.back_home')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTopUpAgain}
          >
            <RotateCcw size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {t('data_4g.try_again')}
            </Text>
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
    color: '#09a0a5',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  usageTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  usageTipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  usageTipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 22,
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
    borderColor: '#09a0a5',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#09a0a5',
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#09a0a5',
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
