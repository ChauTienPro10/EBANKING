import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Colors from '../../../constants/color';
import {
  formatCurrencyByLanguage,
  convertVNDtoUSD,
} from '../../../utils/currency';
import { calculatePercentageChange } from '../utils/statisticsUtils';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ComparisonChartProps {
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  currentLabel: string;
  previousLabel: string;
  chartTitle: string;
  currentPeriodLabel: string; // "Now" or "Hiện tại"
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  currentPeriodTotal,
  previousPeriodTotal,
  currentLabel,
  previousLabel,
  chartTitle,
  currentPeriodLabel,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const screenWidth = Dimensions.get('window').width;
  const percentageChange = calculatePercentageChange(
    currentPeriodTotal,
    previousPeriodTotal,
  );
  const isIncrease = percentageChange >= 0;

  // Chart dimensions - responsive
  // Account for: screen margins (32) + container padding (32) = 64
  const chartWidth = screenWidth - 64;
  const chartHeight = 220;
  const chartPadding = 40; // Y-axis label space
  const barAreaHeight = chartHeight - chartPadding; // Actual bar drawing area

  const data = {
    labels: [previousLabel, currentLabel],
    datasets: [
      {
        data: [previousPeriodTotal, currentPeriodTotal],
        colors: [
          (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // Gray for previous period
          (opacity = 1) => `rgba(9, 160, 165, ${opacity})`, // Teal for current period
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.white,
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(9, 160, 165, ${opacity})`, // main_bule
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // grey3
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5', // Dashed grid lines
      stroke: Colors.border,
      strokeWidth: 1,
      opacity: 3,
    },
    propsForLabels: {
      fontSize: 9,
      fontWeight: '600',
    },
    barPercentage: 0.7, // Wider bars
    barRadius: 8, // Rounded top
    formatYLabel: (value: string) => {
      const num = parseFloat(value);
      if (num === 0) return '0';

      // For large VND values (> 1M), use compact notation
      if (currentLanguage === 'vi' && num >= 1000000) {
        const millions = num / 1000000;
        return `${millions.toFixed(1)}M`;
      }

      // For USD or smaller values, show full formatted number
      return formatCurrencyByLanguage(num).replace(/[₫$]/g, '').trim();
    },
    count: 3, // Only show 3 Y-axis labels (0, middle, max)
    withCustomBarColorFromData: true, // Enable custom colors per bar
  };

  // Calculate label position responsively
  const maxValue = Math.max(currentPeriodTotal, previousPeriodTotal);
  const barHeightRatio = currentPeriodTotal / maxValue;
  const barPixelHeight = barAreaHeight * barHeightRatio;

  // Position label above bar top with responsive offset
  const labelTopPosition = chartHeight - barPixelHeight - chartPadding - 10; // 10px above bar
  // (English "Now" is shorter than Vietnamese "Hiện tại")
  const labelOffset = currentLanguage === 'en' ? -15 : -24;
  const labelRightPosition = chartWidth * 0.25 + labelOffset; // Center on right bar

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{chartTitle}</Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyBadgeText}>
              {currentLanguage === 'en' ? '$' : '₫'}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.badge,
            isIncrease ? styles.badgeIncrease : styles.badgeDecrease,
          ]}
        >
          <Ionicons
            name={isIncrease ? 'trending-up' : 'trending-down'}
            size={14}
            color={isIncrease ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.badgeText,
              isIncrease ? styles.badgeTextIncrease : styles.badgeTextDecrease,
            ]}
          >
            {Math.abs(percentageChange).toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={false}
          fromZero
          segments={3}
        />
        {/* Current period label overlay - responsive positioning */}
        <View
          style={[
            styles.currentLabelOverlay,
            {
              right: labelRightPosition,
              top: labelTopPosition,
            },
          ]}
        >
          <Text style={styles.currentLabelText}>{currentPeriodLabel}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.legendText}>{previousLabel}</Text>
          <Text style={styles.legendValue}>
            {formatCurrencyByLanguage(previousPeriodTotal)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.main_bule }]}
          />
          <Text style={styles.legendText}>{currentLabel}</Text>
          <Text style={styles.legendValue}>
            {formatCurrencyByLanguage(currentPeriodTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    backgroundColor: Colors.main_bule + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currencyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeIncrease: {
    backgroundColor: Colors.successLight,
  },
  badgeDecrease: {
    backgroundColor: Colors.errorLight,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeTextIncrease: {
    color: Colors.success,
  },
  badgeTextDecrease: {
    color: Colors.error,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartContainer: {
    position: 'relative',
  },
  currentLabelOverlay: {
    position: 'absolute',
    backgroundColor: Colors.main_bule + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  legend: {
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default ComparisonChart;
