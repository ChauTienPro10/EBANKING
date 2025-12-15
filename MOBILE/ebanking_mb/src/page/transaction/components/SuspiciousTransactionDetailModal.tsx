import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SuspiciousTransaction } from '../types/suspiciousTypes';
import RiskLevelBadge from './RiskLevelBadge';
import { formatCurrencyByLanguage } from '../../../utils/currency';

interface SuspiciousTransactionDetailModalProps {
  visible: boolean;
  transaction: SuspiciousTransaction | null;
  currentAccountNumber: string;
  onClose: () => void;
  onReportFraud?: (transaction: SuspiciousTransaction) => void;
  onConfirmSafe?: (transaction: SuspiciousTransaction) => void;
}

const { height } = Dimensions.get('window');

const SuspiciousTransactionDetailModal: React.FC<
  SuspiciousTransactionDetailModalProps
> = ({
  visible,
  transaction,
  currentAccountNumber,
  onClose,
  onReportFraud,
  onConfirmSafe,
}) => {
  const { t } = useTranslation();

  if (!transaction) return null;

  const isOutgoing = transaction.senderAccountNumber === currentAccountNumber;
  const otherAccount = isOutgoing
    ? transaction.receiverAccountNumber
    : transaction.senderAccountNumber;

  const maskedAccount =
    otherAccount.length > 7
      ? `${otherAccount.slice(0, 4)}***${otherAccount.slice(-3)}`
      : otherAccount;

  const formatDateTime = () => {
    const date = new Date(transaction.transactionAt);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} AM - ${day}/${month}/${year}`;
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'LATE_NIGHT':
        return t('suspicious_transactions.late_night_detail', {
          time: transaction.reasonDetails?.lateNightTime || '',
        });
      case 'REPEATED_RECIPIENT':
        return t('suspicious_transactions.repeated_detail', {
          count: transaction.reasonDetails?.repeatCount || 0,
        });
      case 'LARGE_AMOUNT':
        return t('suspicious_transactions.large_amount_detail', {
          amount: formatCurrencyByLanguage(transaction.amount),
        });
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="shield-alert"
              size={40}
              color="#FF3B30"
            />
            <Text style={styles.title}>
              {t('suspicious_transactions.title')}
            </Text>
            <View style={styles.riskLevelContainer}>
              <RiskLevelBadge riskLevel={transaction.riskLevel} size="medium" />
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Amount */}
            <View style={styles.amountBox}>
              <Text style={[styles.amount, isOutgoing && styles.amountRed]}>
                {isOutgoing ? '-' : '+'}{' '}
                {formatCurrencyByLanguage(transaction.amount)}
              </Text>
            </View>

            {/* Details */}
            <View style={styles.detailsBox}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
                <Text style={styles.detailLabel}>
                  {t('suspicious_transactions.detail_recipient')}
                </Text>
                <Text style={styles.detailValue}>{maskedAccount}</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.detailLabel}>
                  {t('suspicious_transactions.detail_time')}
                </Text>
                <Text style={styles.detailValue}>{formatDateTime()}</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="identifier"
                  size={20}
                  color="#666"
                />
                <Text style={styles.detailLabel}>
                  {t('suspicious_transactions.detail_transaction_id')}
                </Text>
                <Text style={styles.detailValue}>
                  T{transaction.transactionId}
                </Text>
              </View>

              {transaction.description && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="text" size={20} color="#666" />
                  <Text style={styles.detailLabel}>
                    {t('suspicious_transactions.detail_description')}
                  </Text>
                  <Text style={styles.detailValue}>
                    {transaction.description}
                  </Text>
                </View>
              )}
            </View>

            {/* Reasons */}
            <View style={styles.reasonsBox}>
              <Text style={styles.sectionTitle}>
                {t('suspicious_transactions.suspicious_reasons_title')}
              </Text>
              {transaction.suspiciousReasons.map((reason, index) => (
                <View key={index} style={styles.reasonItem}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={18}
                    color="#FF3B30"
                  />
                  <Text style={styles.reasonText}>{getReasonText(reason)}</Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.recommendBox}>
              <View style={styles.recommendHeader}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.sectionTitle}>
                  {t('suspicious_transactions.recommendations_title')}
                </Text>
              </View>
              <Text style={styles.recommendText}>
                {t('suspicious_transactions.recommendation_1')}
              </Text>
              <Text style={styles.recommendText}>
                {t('suspicious_transactions.recommendation_2')}
              </Text>
              <Text style={styles.recommendText}>
                {t('suspicious_transactions.recommendation_3')}
              </Text>
              <Text style={styles.recommendText}>
                {t('suspicious_transactions.recommendation_4')}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onReportFraud && (
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => {
                  onReportFraud(transaction);
                  onClose();
                }}
              >
                <MaterialCommunityIcons
                  name="alert-octagon"
                  size={18}
                  color="#FF3B30"
                />
                <Text style={styles.reportButtonText}>
                  {t('suspicious_transactions.report_fraud')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onConfirmSafe?.(transaction);
                onClose();
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.confirmButtonText}>
                {t('suspicious_transactions.confirm_safe')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 20,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  riskLevelContainer: {
    position: 'absolute',
    top: 8,
    right: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: height * 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  amountBox: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#34C759',
  },
  amountRed: {
    color: '#FF3B30',
  },
  detailsBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
    flex: 1,
  },
  reasonsBox: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    marginLeft: 4,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
  recommendBox: {
    marginTop: 20,
    marginBottom: 20,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendText: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    backgroundColor: '#FFFFFF',
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 6,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});

export default SuspiciousTransactionDetailModal;
