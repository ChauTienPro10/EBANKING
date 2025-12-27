import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/color';
import { translateDynamicText } from '../../utils/translationHelpers';
import {SpendingCategoryService} from '../../services/SpendingCategoryService';
import {
  CategoryStatistics,
  PeriodType,
} from '../../types/SpendingCategory.types';
import CategoryPieChart from './components/CategoryPieChart';
import PeriodSelector from './components/PeriodSelector';
import CategoryStatsCard from './components/CategoryStatsCard';

const { width } = Dimensions.get('window');

const SpendingManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [statistics, setStatistics] = useState<CategoryStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await SpendingCategoryService.getCategoryStatistics(period);
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to transaction list filtered by category
    // navigation.navigate('TransactionHistory', {categoryId});
  };

  const totalSpending = statistics.reduce(
    (sum, stat) => sum + stat.totalAmount,
    0,
  );
  const topCategory = statistics[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {translateDynamicText('Quản lý chi tiêu')}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CategoryManagement' as never)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.main_bule}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.main_bule} />
          </View>
        ) : statistics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="pie-chart-outline"
              size={80}
              color={Colors.gray_light}
            />
            <Text style={styles.emptyTitle}>
              {translateDynamicText('Chưa có dữ liệu chi tiêu')}
            </Text>
            <Text style={styles.emptySubtitle}>
              Bắt đầu phân loại giao dịch để xem thống kê
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={Colors.main_bule}
                />
                <Text style={styles.summaryLabel}>
                  {translateDynamicText('Tổng chi tiêu')}
                </Text>
                <Text style={styles.summaryValue}>
                  {totalSpending.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              {topCategory && (
                <View style={styles.summaryCard}>
                  <Text style={styles.categoryIcon}>
                    {topCategory.categoryIcon}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    {translateDynamicText('Danh mục chi nhiều nhất')}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {translateDynamicText(topCategory.categoryName)}
                  </Text>
                  <Text style={styles.summaryPercentage}>
                    {topCategory.percentage.toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>

            {/* Pie Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>
                {translateDynamicText('Phân tích chi tiêu')}
              </Text>
              <CategoryPieChart data={statistics} />
            </View>

            {/* Category List */}
            <View style={styles.categoryListContainer}>
              <Text style={styles.sectionTitle}>Chi tiết theo danh mục</Text>
              {statistics.map(stat => (
                <CategoryStatsCard
                  key={stat.categoryId}
                  category={stat}
                  totalAmount={totalSpending}
                  onPress={() => handleCategoryPress(stat.categoryId)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.main_bule,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text_dark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text_dark,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.main_bule,
    marginTop: 2,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text_dark,
    marginBottom: 16,
  },
  categoryListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

export default SpendingManagementScreen;
