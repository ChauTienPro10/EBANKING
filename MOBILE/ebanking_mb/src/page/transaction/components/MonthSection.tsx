import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import TransactionItem from './TransactionItem';
import MonthStatsModal from './MonthStatsModal';
import Colors from '../../../constants/color';

interface MonthSectionProps {
  monthYear: string;
  transactions: TransferResponse[];
  currentAccountNumber: string;
}

const MonthSection: React.FC<MonthSectionProps> = ({
  monthYear,
  transactions,
  currentAccountNumber,
}) => {
  const [showStatsModal, setShowStatsModal] = useState(false);

  return (
    <>
      <View style={styles.monthSection}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{monthYear}</Text>
          <TouchableOpacity onPress={() => setShowStatsModal(true)}>
            <Text style={styles.statsLink}>Thống kê ›</Text>
          </TouchableOpacity>
        </View>
        {transactions.map(transaction => (
          <TransactionItem
            key={transaction.transactionId}
            transaction={transaction}
            currentAccountNumber={currentAccountNumber}
          />
        ))}
      </View>

      {/* Stats Modal */}
      <MonthStatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        monthYear={monthYear}
        transactions={transactions}
        currentAccountNumber={currentAccountNumber}
      />
    </>
  );
};

export default MonthSection;

const styles = StyleSheet.create({
  monthSection: {
    marginBottom: 0,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#E8EAF6',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statsLink: {
    fontSize: 14,
    color: Colors.main_bule,
    fontWeight: '500',
  },
});
