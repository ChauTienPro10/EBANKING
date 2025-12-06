import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchTransactionHistory,
  TransferResponse,
  loadMockData,
} from '../../store/fetchAPI/TransactionHistory';
import Colors from '../../constants/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mockTransactions } from '../../data/mockTransactions';
import { useNavigation } from '@react-navigation/native';

// Import components
import TransactionHeader from './components/TransactionHeader';
import FilterTabs, { FilterTab } from './components/FilterTabs';
import FilterModal from './components/FilterModal';
import MonthSection from './components/MonthSection';

// Import filter types
import {
  FilterState,
  DEFAULT_FILTER_STATE,
  matchesFilters,
} from './types/filterTypes';

const TransactionHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);

  // Filter state
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTER_STATE);

  const username = useSelector(
    (state: RootState) => state.app.loginResponse?.username,
  );
  const sender = useSelector(
    (state: RootState) => state.app.accountTransResponse?.accountNumber,
  );
  const transactions = useSelector(
    (state: RootState) => state.transactionHistories.data,
  );
  const loading = useSelector(
    (state: RootState) => state.transactionHistories.loading,
  );

  const currentAccountNumber = sender || '1234567890';

  useEffect(() => {
    if (useMockData) {
      dispatch(loadMockData(mockTransactions));
    } else if (username && sender) {
      dispatch(
        fetchTransactionHistory({ username, sender, page: 1, limit: 20 }),
      );
    }
  }, [username, sender, dispatch, useMockData]);

  const onRefresh = () => {
    setRefreshing(true);
    if (useMockData) {
      dispatch(loadMockData(mockTransactions));
      setTimeout(() => setRefreshing(false), 500);
    } else if (username && sender) {
      dispatch(
        fetchTransactionHistory({ username, sender, page: 1, limit: 20 }),
      ).finally(() => setRefreshing(false));
    }
  };

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
  };

  // Apply tab filter first, then advanced filters
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Apply tab filter (ALL, INCOMING, OUTGOING, PENDING)
    if (activeFilter === 'INCOMING') {
      filtered = filtered.filter(
        t => t.receiverAccountNumber === currentAccountNumber,
      );
    } else if (activeFilter === 'OUTGOING') {
      filtered = filtered.filter(
        t => t.senderAccountNumber === currentAccountNumber,
      );
    } else if (activeFilter === 'PENDING') {
      filtered = filtered.filter(t => t.status === 'PENDING');
    }

    // Apply advanced filters from modal
    filtered = filtered.filter(transaction =>
      matchesFilters(transaction, appliedFilters),
    );

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Group transactions by month
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = new Date(transaction.transactionAt);
      const monthYear = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(transaction);
      return groups;
    },
    {} as Record<string, TransferResponse[]>,
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <TransactionHeader
          title="Lịch sử giao dịch"
          onBack={() => navigation.goBack()}
          onFilterPress={() => setShowFilterModal(true)}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TransactionHeader
        title="Lịch sử giao dịch"
        onBack={() => navigation.goBack()}
        onFilterPress={() => setShowFilterModal(true)}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        showAllMonths={showAllMonths}
        onToggleMonths={() => setShowAllMonths(!showAllMonths)}
        onApplyFilters={handleApplyFilters}
        initialFilters={appliedFilters}
      />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.main_bule]}
            tintColor={Colors.main_bule}
          />
        }
      >
        {Object.keys(groupedTransactions).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có giao dịch</Text>
          </View>
        ) : (
          Object.entries(groupedTransactions).map(
            ([monthYear, transactions]) => (
              <MonthSection
                key={monthYear}
                monthYear={monthYear}
                transactions={transactions}
                currentAccountNumber={currentAccountNumber}
              />
            ),
          )
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
