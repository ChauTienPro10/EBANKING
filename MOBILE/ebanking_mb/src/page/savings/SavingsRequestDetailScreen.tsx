import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsRequest } from '../../types/SavingsTypes';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<
  RootStackParamList,
  'SavingsRequestDetail'
>;

export default function SavingsRequestDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { requestNumber } = route.params;

  const [request, setRequest] = useState<SavingsRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { t } = useTranslation();

  const loadRequestDetail = async () => {
    try {
      const requestData = await SavingsService.getSavingsRequestDetail(
        requestNumber,
      );
      setRequest(requestData);
    } catch (error) {
      console.error('Error loading request detail:', error);
      Alert.alert(t('savings.error_title'), t('savings.error_load_request'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequestDetail();
    }, [requestNumber]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequestDetail();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'APPROVED':
        return '#14B8A6';
      case 'REJECTED':
        return '#EF4444';
      case 'CANCELLED':
        return '#94A3B8';
      default:
        return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('savings.status_pending');
      case 'APPROVED':
        return t('savings.status_approved');
      case 'REJECTED':
        return t('savings.status_rejected');
      case 'CANCELLED':
        return t('savings.status_cancelled');
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'DEPOSIT'
      ? t('savings.cash_deposit')
      : t('savings.cash_withdraw');
  };

  const getTypeIcon = (type: string) => {
    return type === 'DEPOSIT' ? 'cash-outline' : 'wallet-outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'APPROVED':
        return 'checkmark-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      case 'CANCELLED':
        return 'ban-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleCancelRequest = () => {
    if (!request || request.status !== 'PENDING') return;

    Alert.alert(
      t('savings.confirm_cancel_title'),
      t('savings.confirm_cancel_message'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('savings.cancel_request'),
          style: 'destructive',
          onPress: performCancel,
        },
      ],
    );
  };

  const performCancel = async () => {
    setCancelling(true);
    try {
      await SavingsService.cancelSavingsRequest(requestNumber);

      Alert.alert(
        t('savings.success_title'),
        t('savings.success_cancel_request'),
        [
          {
            text: 'OK',
            onPress: () => {
              loadRequestDetail();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert(t('savings.error_title'), t('savings.error_cancel_request'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={t('savings.request_detail_title')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>{t('savings.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <Header title={t('savings.request_detail_title')} showBackButton />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>
            {t('savings.error_request_not_found')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t('savings.request_detail_title')} showBackButton />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D9488']}
            tintColor="#0D9488"
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getTypeIcon(request.type)}
              size={28}
              color="#0D9488"
            />
          </View>
          <Text style={styles.typeText}>{getTypeText(request.type)}</Text>
          <Text style={styles.amount}>{formatCurrency(request.amount)}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(request.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(request.status)}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>
              {getStatusText(request.status)}
            </Text>
          </View>
        </View>

        {/* Thông tin yêu cầu */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={19} color="#94A3B8" />
            <Text style={styles.cardTitle}>{t('savings.request_info')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.request_code')}</Text>
            <Text style={styles.infoValue}>{request.requestNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.savings_account')}</Text>
            <Text style={styles.infoValue}>{request.savingsAccountNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.request_type')}</Text>
            <Text style={styles.infoValue}>{getTypeText(request.type)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.amount')}</Text>
            <Text style={[styles.infoValue, styles.amountValue]}>
              {formatCurrency(request.amount)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('savings.created_date')}</Text>
            <Text style={styles.infoValue}>
              {formatDate(request.requestDate)}
            </Text>
          </View>
        </View>

        {/* Thông tin xử lý */}
        {(request.processedDate || request.processedBy) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="checkmark-done-outline"
                size={19}
                color="#94A3B8"
              />
              <Text style={styles.cardTitle}>
                {t('savings.processing_info')}
              </Text>
            </View>

            {request.processedDate && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {t('savings.processed_date')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {formatDate(request.processedDate)}
                  </Text>
                </View>
                {request.processedBy && <View style={styles.divider} />}
              </>
            )}

            {request.processedBy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {t('savings.processed_by')}
                </Text>
                <Text style={styles.infoValue}>{request.processedBy}</Text>
              </View>
            )}
          </View>
        )}

        {/* Ghi chú */}
        {request.note && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={19} color="#94A3B8" />
              <Text style={styles.cardTitle}>{t('savings.note')}</Text>
            </View>
            <Text style={styles.noteText}>{request.note}</Text>
          </View>
        )}

        {/* Lý do từ chối */}
        {request.reason && (
          <View style={styles.reasonCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={19} color="#DC2626" />
              <Text style={[styles.cardTitle, { color: '#DC2626' }]}>
                {t('savings.rejection_reason')}
              </Text>
            </View>
            <Text style={styles.reasonText}>{request.reason}</Text>
          </View>
        )}

        {/* Hướng dẫn */}
        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color="#0F766E"
            />
            <Text style={[styles.cardTitle, { color: '#0F766E' }]}>
              {t('savings.notice')}
            </Text>
          </View>

          {request.status === 'PENDING' && (
            <View style={styles.guideItem}>
              <Ionicons
                name="time-outline"
                size={17}
                color="#0F766E"
                style={styles.guideIcon}
              />
              <Text style={styles.guideText}>{t('savings.guide_pending')}</Text>
            </View>
          )}

          {request.status === 'APPROVED' && request.type === 'DEPOSIT' && (
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#0F766E"
                style={styles.guideIcon}
              />
              <Text style={styles.guideText}>
                {t('savings.guide_approved_deposit')}
              </Text>
            </View>
          )}

          {request.status === 'APPROVED' && request.type === 'WITHDRAW' && (
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#059669"
                style={styles.guideIcon}
              />
              <Text style={styles.guideText}>
                {t('savings.guide_approved_withdraw')}
              </Text>
            </View>
          )}

          {request.status === 'REJECTED' && (
            <View style={styles.guideItem}>
              <Ionicons
                name="close-circle-outline"
                size={17}
                color="#0F766E"
                style={styles.guideIcon}
              />
              <Text style={styles.guideText}>
                {t('savings.guide_rejected')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Nút hủy yêu cầu */}
      {request.status === 'PENDING' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.disabledButton]}
            onPress={handleCancelRequest}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            {cancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.cancelButtonText}>
                  {t('savings.cancel_request')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8B92A6',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 15,
    color: '#8B92A6',
    marginTop: 16,
    textAlign: 'center',
  },

  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 5,
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.1,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '700',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },

  // Note
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Reason Card
  reasonCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reasonText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Guide Card
  guideCard: {
    backgroundColor: '#F0FDFA',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guideIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: '#0F766E',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Bottom Button
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
