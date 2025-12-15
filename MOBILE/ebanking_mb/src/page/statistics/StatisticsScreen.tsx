import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState } from '../../store';
import Colors from '../../constants/color';
import PeriodDropdown from './components/PeriodDropdown';
import StatisticsCard from './components/StatisticsCard';
import ComparisonChart from './components/ComparisonChart';
import TrendLineChart from './components/TrendLineChart';
import TopInsights from './components/TopInsights';
import {
  TimePeriod,
  filterTransactionsByPeriod,
  calculatePeriodStats,
  getPeriodLabel,
  calculateTrendData,
} from './utils/statisticsUtils';
import { generateMockTransactions, USE_MOCK_DATA } from './utils/mockData';

const StatisticsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Get data from Redux
  const transactionsFromRedux = useSelector(
    (state: RootState) => state.transactionHistories.data,
  );
  const currentAccountNumber = useSelector(
    (state: RootState) => state.app.accountTransResponse?.accountNumber || '',
  );

  // Use mock data if enabled and no real transactions
  const transactions = useMemo(() => {
    if (USE_MOCK_DATA && transactionsFromRedux.length === 0) {
      return generateMockTransactions(
        currentAccountNumber || '1234567890123456',
      );
    }
    return transactionsFromRedux;
  }, [transactionsFromRedux, currentAccountNumber]);

  // Calculate statistics for current and previous periods
  const statistics = useMemo(() => {
    const currentTransactions = filterTransactionsByPeriod(
      transactions,
      selectedPeriod,
      0,
    );
    const previousTransactions = filterTransactionsByPeriod(
      transactions,
      selectedPeriod,
      1,
    );

    const currentStats = calculatePeriodStats(
      currentTransactions,
      currentAccountNumber,
    );
    const previousStats = calculatePeriodStats(
      previousTransactions,
      currentAccountNumber,
    );

    return {
      current: currentStats,
      previous: previousStats,
      currentLabel: getPeriodLabel(selectedPeriod, 0, t),
      previousLabel: getPeriodLabel(selectedPeriod, 1, t),
    };
  }, [transactions, selectedPeriod, currentAccountNumber, t]);

  // Calculate trend data for line chart
  const trendData = useMemo(() => {
    const currentTransactions = filterTransactionsByPeriod(
      transactions,
      selectedPeriod,
      0,
    );
    return calculateTrendData(
      currentTransactions,
      selectedPeriod,
      currentAccountNumber,
    );
  }, [transactions, selectedPeriod, currentAccountNumber]);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you would dispatch a Redux action to fetch new data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const currentTotal =
    statistics.current.totalIncoming + statistics.current.totalOutgoing;
  const previousTotal =
    statistics.previous.totalIncoming + statistics.previous.totalOutgoing;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.main_bule} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('statistics.title_short')}</Text>
        </View>
        <View style={styles.headerRight}>
          <PeriodDropdown
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            weekLabel={t('statistics.week')}
            monthLabel={t('statistics.month')}
            yearLabel={t('statistics.year')}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.main_bule]}
            tintColor={Colors.main_bule}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <StatisticsCard
            icon="swap-horizontal"
            label={t('statistics.total_transactions')}
            value={statistics.current.totalTransactions}
            color={Colors.main_bule}
            isCount={true}
          />
          <StatisticsCard
            icon="arrow-down-circle"
            label={t('statistics.total_incoming')}
            value={statistics.current.totalIncoming}
            color={Colors.success}
          />
          <StatisticsCard
            icon="arrow-up-circle"
            label={t('statistics.total_outgoing')}
            value={statistics.current.totalOutgoing}
            color={Colors.error}
          />
        </View>

        {/* Comparison Chart */}
        <ComparisonChart
          currentPeriodTotal={currentTotal}
          previousPeriodTotal={previousTotal}
          currentLabel={statistics.currentLabel}
          previousLabel={statistics.previousLabel}
          chartTitle={t('statistics.comparison_chart_title')}
          currentPeriodLabel={t('statistics.current_period')}
        />

        {/* Trend Line Chart */}
        <TrendLineChart
          data={trendData.data}
          labels={trendData.labels}
          period={selectedPeriod}
          title={t('statistics.trend_chart_title')}
        />

        {/* Top Insights */}
        <TopInsights
          largestTransaction={statistics.current.largestTransaction}
          mostFrequentRecipient={statistics.current.mostFrequentRecipient}
          averageTransaction={statistics.current.averageTransaction}
          currentAccountNumber={currentAccountNumber}
          largestLabel={t('statistics.largest_transaction')}
          frequentLabel={t('statistics.most_frequent_recipient')}
          averageLabel={t('statistics.average_transaction')}
          transactionsLabel={t('statistics.transactions')}
          totalLabel={t('statistics.total')}
          noDataLabel={t('statistics.no_data')}
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerLeft: {
    width: 70,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default StatisticsScreen;
//test
