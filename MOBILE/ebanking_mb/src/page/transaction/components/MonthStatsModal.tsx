import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import Colors from '../../../constants/color';

interface MonthStatsModalProps {
  visible: boolean;
  onClose: () => void;
  monthYear: string;
  transactions: TransferResponse[];
  currentAccountNumber: string;
}

const MonthStatsModal: React.FC<MonthStatsModalProps> = ({
  visible,
  onClose,
  monthYear,
  transactions,
  currentAccountNumber,
}) => {
  // Calculate total income and expenses
  const calculateStats = (): { totalIncome: number; totalExpense: number } => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      const isIncoming =
        transaction.receiverAccountNumber === currentAccountNumber;

      if (isIncoming) {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    return { totalIncome, totalExpense };
  };

  const { totalIncome, totalExpense } = calculateStats();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons
                  name="stats-chart"
                  size={24}
                  color={Colors.main_bule}
                />
                <Text style={styles.headerTitle}>Thống kê {monthYear}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Stats Cards - Vertical Layout */}
            <View style={styles.statsContainer}>
              {/* Income Card */}
              <View style={[styles.statCard, styles.incomeCard]}>
                <View style={styles.cardRow}>
                  <View style={styles.iconContainer}>
                    <View style={styles.incomeIconBg}>
                      <Ionicons name="arrow-down" size={20} color="#4CAF50" />
                    </View>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.statLabel}>Tổng thu</Text>
                    <Text
                      style={styles.incomeAmount}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      +{totalIncome.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  <Text style={styles.transactionCount}>
                    {
                      transactions.filter(
                        t => t.receiverAccountNumber === currentAccountNumber,
                      ).length
                    }{' '}
                    Giao dịch
                  </Text>
                </View>
              </View>

              {/* Expense Card */}
              <View style={[styles.statCard, styles.expenseCard]}>
                <View style={styles.cardRow}>
                  <View style={styles.iconContainer}>
                    <View style={styles.expenseIconBg}>
                      <Ionicons name="arrow-up" size={20} color="#F44336" />
                    </View>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.statLabel}>Tổng chi</Text>
                    <Text
                      style={styles.expenseAmount}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      -{totalExpense.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  <Text style={styles.transactionCount}>
                    {
                      transactions.filter(
                        t => t.senderAccountNumber === currentAccountNumber,
                      ).length
                    }{' '}
                    Giao dịch
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MonthStatsModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
  },
  incomeCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  incomeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
  },
  transactionCount: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    flexShrink: 0,
  },
});
