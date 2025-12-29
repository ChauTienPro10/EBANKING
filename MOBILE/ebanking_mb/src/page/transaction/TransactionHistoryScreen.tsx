import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchTransactionHistory,
  loadMoreTransactions,
  TransferResponse,
} from '../../store/fetchAPI/TransactionHistory';
import Colors from '../../constants/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const hasMore = useSelector(
    (state: RootState) => state.transactionHistories.hasMore,
  );
  const loadingMore = useSelector(
    (state: RootState) => state.transactionHistories.loadingMore,
  );
  const currentPage = useSelector(
    (state: RootState) => state.transactionHistories.currentPage,
  );

  const currentAccountNumber = sender || '1234567890';

  useEffect(() => {
    if (username && sender) {
      dispatch(
        fetchTransactionHistory({ username, sender, page: 1, limit: 20 }),
      );
    }
  }, [dispatch, username, sender]);

  const onRefresh = () => {
    setRefreshing(true);
    if (username && sender) {
      dispatch(
        fetchTransactionHistory({ username, sender, page: 1, limit: 20 }),
      ).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
  };

  const handleLoadMore = () => {
    if (username && sender && hasMore && !loadingMore) {
      dispatch(
        loadMoreTransactions({
          username,
          sender,
          page: currentPage + 1,
          limit: 20,
        }),
      );
    }
  };

  // Apply tab filter first, then advanced filters
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Apply tab filter (ALL, INCOMING, OUTGOING)
    if (activeFilter === 'INCOMING') {
      filtered = filtered.filter(
        t => t.receiverAccountNumber === currentAccountNumber,
      );
    } else if (activeFilter === 'OUTGOING') {
      filtered = filtered.filter(
        t => t.senderAccountNumber === currentAccountNumber,
      );
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
            <MaterialCommunityIcons
              name="inbox-outline"
              size={75}
              color="#B0BEC5"
            />
            <Text style={styles.emptyText}>Chưa có giao dịch</Text>
          </View>
        ) : (
          <>
            {Object.entries(groupedTransactions).map(
              ([monthYear, transactions]) => (
                <MonthSection
                  key={monthYear}
                  monthYear={monthYear}
                  transactions={transactions}
                  currentAccountNumber={currentAccountNumber}
                />
              ),
            )}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={Colors.main_bule} />
                ) : (
                  <Text style={styles.loadMoreText}>Xem thêm</Text>
                )}
              </TouchableOpacity>
            )}
          </>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#B0BEC5',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreText: {
    fontSize: 16,
    color: Colors.main_bule,
    fontWeight: '600',
  },
});
