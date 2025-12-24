import React, { useState, useMemo } from 'react';
// Re-trigger bundle
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
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../store';
import { AnalysisData } from '../../store/AnalysisModel';
import {
  fetchAnalysis30Days,
  fetchAnalysisCurrentMonth,
  fetchAnalysisPreviousMonth,
  fetchAnalysisCurrentWeek,
  fetchAnalysisPreviousWeek,
  fetchAnalysisWeeklyStats,
} from '../../store/fetchAPI/AnalysisFetch';
import { fetchTransactionHistory } from '../../store/fetchAPI/TransactionHistory';
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
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Default currency based on language, but allow toggle
  const [displayCurrency, setDisplayCurrency] = useState<'VND' | 'USD'>(
    i18n.language === 'en' ? 'USD' : 'VND',
  );

  const toggleCurrency = () => {
    setDisplayCurrency(prev => (prev === 'VND' ? 'USD' : 'VND'));
  };

  // Get data from Redux
  const {
    analysisCurrentMonth,
    analysisPreviousMonth,
    analysisCurrentWeek,
    analysisPreviousWeek,
    analysisWeeklyStats,
    isLoggedIn,
    loginResponse,
  } = useSelector((state: RootState) => state.app);

  const currentAccountNumber = useSelector(
    (state: RootState) => state.app.accountTransResponse?.accountNumber || '',
  );

  // Get real transaction history from Redux
  const realTransactions = useSelector(
    (state: RootState) => state.transactionHistories?.data || [],
  );

  // Generate mock transactions for historical data
  const mockTransactions = useMemo(() => {
    if (USE_MOCK_DATA && currentAccountNumber) {
      return generateMockTransactions(currentAccountNumber);
    }
    return [];
  }, [currentAccountNumber]);

  // Merge real transactions with mock transactions
  const allTransactions = useMemo(() => {
    // Filter out savings transactions
    const filteredReal = realTransactions.filter(t => {
      // Filter by transaction type
      if (
        t.transactionType === 'PAYMENT_TO_SAVINGS' ||
        t.transactionType === 'SAVINGS_TO_PAYMENT'
      ) {
        return false;
      }

      // Filter by description (case-insensitive)
      const desc = (t.description || '').toLowerCase();
      if (
        desc.includes('tiết kiệm') ||
        desc.includes('tiet kiem') ||
        desc.includes('savings')
      ) {
        return false;
      }

      return true;
    });

    const merged = [...filteredReal, ...mockTransactions];
    return merged;
  }, [realTransactions, mockTransactions]);

  // Derive current and previous period data based on selection
  const periodData = useMemo(() => {
    let current: AnalysisData | null = null;
    let previous: AnalysisData | null = null;

    if (selectedPeriod === 'week') {
      current = analysisCurrentWeek;
      previous = analysisPreviousWeek;
    } else if (selectedPeriod === 'month') {
      current = analysisCurrentMonth;
      // Use mock data for previous month if enabled
      if (USE_MOCK_DATA && mockTransactions.length > 0) {
        const previousMonthTransactions = filterTransactionsByPeriod(
          mockTransactions,
          selectedPeriod,
          1,
        );

        const stats = calculatePeriodStats(
          previousMonthTransactions,
          currentAccountNumber,
        );

        previous = {
          totalAmountInPeriodByUsername: stats.totalOutgoing,
          totalIncomingAmount: stats.totalIncoming,
          transactionCountInPeriodByUsername: stats.totalTransactions,
          transactionLargestInPeriodByUsername: stats.largestTransaction,
          mostAccountInfoTransferManyTimeInPeriod: stats.mostFrequentRecipient
            ? ({
                accountNumber: stats.mostFrequentRecipient.accountNumber,
              } as any)
            : null,
          mostAccountInfoTransferManyTimeInPeriodCount:
            stats.mostFrequentRecipient?.count || 0,
          mostAccountInfoTransferManyTimeInPeriodTotalAmount:
            stats.mostFrequentRecipient?.totalAmount || 0,
        } as AnalysisData;
      } else {
        previous = analysisPreviousMonth;
      }
    } else if (selectedPeriod === 'year') {
      // For year: use mock data for both current year (2025) and previous year (2024)
      if (USE_MOCK_DATA && mockTransactions.length > 0) {
        // Current year (2025) - use API data if available, otherwise mock
        const currentYearTransactions = filterTransactionsByPeriod(
          mockTransactions,
          selectedPeriod,
          0,
        );
        const currentStats = calculatePeriodStats(
          currentYearTransactions,
          currentAccountNumber,
        );

        // Combine with API data for current month (Dec 2025)
        const apiCurrentTotal =
          analysisCurrentMonth?.totalAmountInPeriodByUsername || 0;
        const apiCurrentIncoming =
          analysisCurrentMonth?.totalIncomingAmount || 0;
        const apiCurrentCount =
          analysisCurrentMonth?.transactionCountInPeriodByUsername || 0;

        current = {
          totalAmountInPeriodByUsername:
            currentStats.totalOutgoing + apiCurrentTotal,
          totalIncomingAmount: currentStats.totalIncoming + apiCurrentIncoming,
          transactionCountInPeriodByUsername:
            currentStats.totalTransactions + apiCurrentCount,
          transactionLargestInPeriodByUsername:
            currentStats.largestTransaction ||
            analysisCurrentMonth?.transactionLargestInPeriodByUsername ||
            null,
          mostAccountInfoTransferManyTimeInPeriod:
            currentStats.mostFrequentRecipient
              ? ({
                  accountNumber:
                    currentStats.mostFrequentRecipient.accountNumber,
                } as any)
              : null,
          mostAccountInfoTransferManyTimeInPeriodCount:
            currentStats.mostFrequentRecipient?.count || 0,
          mostAccountInfoTransferManyTimeInPeriodTotalAmount:
            currentStats.mostFrequentRecipient?.totalAmount || 0,
        } as AnalysisData;

        // Previous year (2024) - use mock data
        const previousYearTransactions = filterTransactionsByPeriod(
          mockTransactions,
          selectedPeriod,
          1,
        );
        const previousStats = calculatePeriodStats(
          previousYearTransactions,
          currentAccountNumber,
        );
        previous = {
          totalAmountInPeriodByUsername: previousStats.totalOutgoing,
          totalIncomingAmount: previousStats.totalIncoming,
          transactionCountInPeriodByUsername: previousStats.totalTransactions,
          transactionLargestInPeriodByUsername:
            previousStats.largestTransaction,
          mostAccountInfoTransferManyTimeInPeriod:
            previousStats.mostFrequentRecipient
              ? ({
                  accountNumber:
                    previousStats.mostFrequentRecipient.accountNumber,
                } as any)
              : null,
          mostAccountInfoTransferManyTimeInPeriodCount:
            previousStats.mostFrequentRecipient?.count || 0,
          mostAccountInfoTransferManyTimeInPeriodTotalAmount:
            previousStats.mostFrequentRecipient?.totalAmount || 0,
        } as AnalysisData;
      }
    }

    return {
      current,
      previous,
      currentLabel: getPeriodLabel(selectedPeriod, 0, t),
      previousLabel: getPeriodLabel(selectedPeriod, 1, t),
    };
  }, [
    selectedPeriod,
    analysisCurrentWeek,
    analysisPreviousWeek,
    analysisCurrentMonth,
    analysisPreviousMonth,
    mockTransactions,
    currentAccountNumber,
    t,
  ]);

  // Calculate trend data for line chart
  const trendData = useMemo(() => {
    // For current period, use only REAL transactions (no mock data)
    // This ensures we only show actual transaction history
    const filteredReal = realTransactions.filter(t => {
      // Filter by transaction type
      if (
        t.transactionType === 'PAYMENT_TO_SAVINGS' ||
        t.transactionType === 'SAVINGS_TO_PAYMENT'
      ) {
        return false;
      }

      // Filter by description (case-insensitive)
      const desc = (t.description || '').toLowerCase();
      if (
        desc.includes('tiết kiệm') ||
        desc.includes('tiet kiem') ||
        desc.includes('savings')
      ) {
        return false;
      }

      return true;
    });

    if (filteredReal.length > 0) {
      const currentPeriodTransactions = filterTransactionsByPeriod(
        filteredReal,
        selectedPeriod,
        0,
      );

      return calculateTrendData(
        currentPeriodTransactions,
        selectedPeriod,
        currentAccountNumber,
      );
    }

    return { labels: [], data: [] };
  }, [selectedPeriod, realTransactions, currentAccountNumber]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isLoggedIn && loginResponse?.username && currentAccountNumber) {
      await Promise.all([
        dispatch(fetchAnalysis30Days(loginResponse.username)),
        dispatch(fetchAnalysisCurrentMonth(loginResponse.username)),
        dispatch(fetchAnalysisPreviousMonth(loginResponse.username)),
        dispatch(fetchAnalysisCurrentWeek(loginResponse.username)),
        dispatch(fetchAnalysisPreviousWeek(loginResponse.username)),
        dispatch(fetchAnalysisWeeklyStats(loginResponse.username)),
        dispatch(
          fetchTransactionHistory({
            username: loginResponse.username,
            sender: currentAccountNumber,
            page: 0,
            limit: 100,
          }),
        ),
      ]);
    }
    setRefreshing(false);
  };

  const currentTotal = periodData.current?.totalAmountInPeriodByUsername || 0;
  const previousTotal = periodData.previous?.totalAmountInPeriodByUsername || 0;
  const totalIncoming = periodData.current?.totalIncomingAmount || 0;

  const currentTransactionCount =
    periodData.current?.transactionCountInPeriodByUsername || 0;

  // Map AnalysisData to TopInsights props
  // Use previous period data if current period has no insights
  const insightsData = periodData.current?.transactionLargestInPeriodByUsername
    ? periodData.current
    : periodData.previous;

  const largestTransaction =
    insightsData?.transactionLargestInPeriodByUsername || null;

  const mostFrequentRecipient =
    insightsData?.mostAccountInfoTransferManyTimeInPeriod
      ? {
          accountNumber:
            insightsData.mostAccountInfoTransferManyTimeInPeriod.accountNumber,
          count: insightsData.mostAccountInfoTransferManyTimeInPeriodCount,
          totalAmount:
            insightsData.mostAccountInfoTransferManyTimeInPeriodTotalAmount,
        }
      : null;

  const averageTransaction =
    currentTransactionCount > 0 ? currentTotal / currentTransactionCount : 0;

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
          <View style={styles.headerControls}>
            <TouchableOpacity
              onPress={toggleCurrency}
              style={styles.currencyToggle}
            >
              <Text style={styles.currencyToggleText}>{displayCurrency}</Text>
            </TouchableOpacity>
            <PeriodDropdown
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              weekLabel={t('statistics.week')}
              monthLabel={t('statistics.month')}
              yearLabel={t('statistics.year')}
            />
          </View>
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
            icon="arrow-up-circle"
            label={t('statistics.total_outgoing')}
            value={currentTotal}
            color={Colors.error}
            currency={displayCurrency}
          />
          <StatisticsCard
            icon="arrow-down-circle"
            label={t('statistics.total_incoming')}
            value={totalIncoming}
            color={Colors.success}
            currency={displayCurrency}
          />
          <StatisticsCard
            icon="swap-horizontal"
            label={t('statistics.total_transactions')}
            value={currentTransactionCount}
            color={Colors.main_bule}
            isCount={true}
            currency={displayCurrency}
          />
        </View>

        {/* Comparison Chart */}
        <ComparisonChart
          currentPeriodTotal={currentTotal}
          previousPeriodTotal={previousTotal}
          currentLabel={periodData.currentLabel}
          previousLabel={periodData.previousLabel}
          chartTitle={t('statistics.comparison_chart_title')}
          currentPeriodLabel={t('statistics.current_period')}
          currency={displayCurrency}
        />

        {/* Trend Line Chart */}
        <TrendLineChart
          data={trendData.data}
          labels={trendData.labels}
          period={selectedPeriod}
          title={t('statistics.trend_chart_title')}
          currency={displayCurrency}
        />

        {/* Top Insights */}
        <TopInsights
          largestTransaction={largestTransaction}
          mostFrequentRecipient={mostFrequentRecipient}
          averageTransaction={averageTransaction}
          currentAccountNumber={currentAccountNumber}
          largestLabel={t('statistics.largest_transaction')}
          frequentLabel={t('statistics.most_frequent_recipient')}
          averageLabel={t('statistics.average_transaction')}
          transactionsLabel={t('statistics.transactions')}
          totalLabel={t('statistics.total')}
          noDataLabel={t('statistics.no_data')}
          currency={displayCurrency}
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
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 110, // Increased width
    alignItems: 'flex-end',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  currencyToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
