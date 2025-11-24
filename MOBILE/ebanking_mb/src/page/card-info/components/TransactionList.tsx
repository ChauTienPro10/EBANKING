import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import {
  TransferIcon,
  CashIcon,
  UserIcon,
  CardIcon,
  PhoneIcon,
} from '../../../components/icon';
import { Transaction, formatCurrency } from '../mockCardData';

type FilterType = 'all' | 'sent' | 'received';

interface TransactionListProps {
  transactions: Transaction[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const getTransactionIcon = (iconName: string) => {
  const iconProps = { size: 24, color: Colors.white };

  switch (iconName) {
    case 'cart':
      return <CardIcon {...iconProps} />;
    case 'phone':
      return <PhoneIcon {...iconProps} />;
    case 'user':
      return <UserIcon {...iconProps} />;
    case 'transfer':
      return <TransferIcon {...iconProps} />;
    case 'cash':
      return <CashIcon {...iconProps} />;
    default:
      return <CardIcon {...iconProps} />;
  }
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({
  transaction,
}) => {
  const isReceived = transaction.type === 'received';
  const amountColor = isReceived ? Colors.main_green : Colors.orange;
  const amountPrefix = isReceived ? '+' : '-';

  return (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: isReceived
                ? Colors.main_green
                : Colors.main_bule,
            },
          ]}
        >
          {getTransactionIcon(transaction.merchantIcon)}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.merchantName}>{transaction.merchantName}</Text>
          <Text style={styles.transactionDate}>
            {transaction.date} • {transaction.time}
          </Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {amountPrefix} {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('card.transactions')}</Text>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'all' && styles.activeFilterTab,
          ]}
          onPress={() => onFilterChange('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'all' && styles.activeFilterTabText,
            ]}
          >
            {t('card.all')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'sent' && styles.activeFilterTab,
          ]}
          onPress={() => onFilterChange('sent')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'sent' && styles.activeFilterTabText,
            ]}
          >
            {t('card.sent')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'received' && styles.activeFilterTab,
          ]}
          onPress={() => onFilterChange('received')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'received' && styles.activeFilterTabText,
            ]}
          >
            {t('card.received')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <View style={styles.transactionList}>
        {transactions.map(transaction => (
          <TransactionItem
            key={transaction.transactionId}
            transaction={transaction}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterTab: {
    backgroundColor: Colors.main_bule,
    borderColor: Colors.main_bule,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey3,
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.grey3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
