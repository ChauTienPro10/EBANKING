import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SuspiciousTransaction } from '../types/suspiciousTypes';
import RiskLevelBadge from './RiskLevelBadge';
import SuspiciousReasonTag from './SuspiciousReasonTag';
import { formatCurrencyByLanguage } from '../../../utils/currency';

interface SuspiciousTransactionCardProps {
  transaction: SuspiciousTransaction;
  currentAccountNumber: string;
  onPress: (transaction: SuspiciousTransaction) => void;
}

const SuspiciousTransactionCard: React.FC<SuspiciousTransactionCardProps> = ({
  transaction,
  currentAccountNumber,
  onPress,
}) => {
  const { t } = useTranslation();

  const isOutgoing = transaction.senderAccountNumber === currentAccountNumber;
  const otherAccount = isOutgoing
    ? transaction.receiverAccountNumber
    : transaction.senderAccountNumber;

  // Mask account number (show first 4 and last 3 digits)
  const maskedAccount =
    otherAccount.length > 7
      ? `${otherAccount.slice(0, 4)}***${otherAccount.slice(-3)}`
      : otherAccount;

  // Format transaction time
  const formatTime = () => {
    const date = new Date(transaction.transactionAt);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}`;
  };

  // Get detail for reason tag
  const getReasonDetail = (reason: string) => {
    switch (reason) {
      case 'LATE_NIGHT':
        return transaction.reasonDetails?.lateNightTime;
      case 'REPEATED_RECIPIENT':
        return transaction.reasonDetails?.repeatCount
          ? `${transaction.reasonDetails.repeatCount}x`
          : undefined;
      default:
        return undefined;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      {/* Risk Badge - Top Right Corner */}
      <View style={styles.badgeContainer}>
        <RiskLevelBadge riskLevel={transaction.riskLevel} size="small" />
      </View>

      {/* Amount - Top */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isOutgoing && styles.amountOutgoing]}>
          {isOutgoing ? '-' : '+'}{' '}
          {formatCurrencyByLanguage(transaction.amount)}
        </Text>
        <Text style={styles.currency}></Text>
      </View>

      {/* Time and Account - Same Row */}
      <View style={styles.infoRow}>
        <View style={styles.accountInfo}>
          <MaterialCommunityIcons
            name={isOutgoing ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={16}
            color={isOutgoing ? '#FF3B30' : '#34C759'}
          />
          <Text style={styles.accountNumber}>{maskedAccount}</Text>
        </View>
        <Text style={styles.time}>{formatTime()}</Text>
      </View>

      {/* Suspicious Reasons */}
      <View style={styles.reasonsContainer}>
        {transaction.suspiciousReasons.map((reason, index) => (
          <SuspiciousReasonTag
            key={`${reason}-${index}`}
            reason={reason}
            detail={getReasonDetail(reason)}
          />
        ))}
      </View>

      {/* Description */}
      {transaction.description && (
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
      )}

      {/* Arrow indicator */}
      <View style={styles.arrowContainer}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#C7C7CC"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34C759',
  },
  amountOutgoing: {
    color: '#FF3B30',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumber: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 6,
    fontWeight: '500',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1,
  },
});

export default SuspiciousTransactionCard;
