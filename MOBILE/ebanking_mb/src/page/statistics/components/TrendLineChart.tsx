import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from '../../../constants/color';
import { TimePeriod } from '../utils/statisticsUtils';
import { useTranslation } from 'react-i18next';
import { convertVNDtoUSD } from '../../../utils/currency';

interface TrendLineChartProps {
  data: number[];
  labels: string[];
  period: TimePeriod;
  title: string;
  currency?: 'VND' | 'USD';
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  labels,
  period,
  title,
  currency,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const screenWidth = Dimensions.get('window').width;

  // Convert data based on currency prop
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data.map(value => {
          if (currency === 'USD') {
            // For USD: show actual converted values (no millions)
            return convertVNDtoUSD(value);
          }
          // For VND: convert to millions
          return value / 1000000;
        }),
        color: (opacity = 1) => `rgba(9, 160, 165, ${opacity})`, // Teal
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.white,
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(9, 160, 165, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.main_bule,
      fill: Colors.white,
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: Colors.border,
      strokeWidth: 1,
      opacity: 3,
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: '600',
    },
    fillShadowGradient: Colors.main_bule,
    fillShadowGradientOpacity: 0.1,
  };

  // Check for empty or all-zero data
  const isAllZeros = data.length === 0 || data.every(v => v === 0);

  if (isAllZeros) {
    return (
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.chart, { height: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }]}>
          <Text style={{ color: Colors.textSecondary }}>{i18n.t('statistics.no_data') || 'No Data'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyBadgeText}>
            {currency === 'USD' ? '$' : '₫'}
          </Text>
        </View>
      </View>
      <LineChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisSuffix={currency === 'USD' ? '' : 'M'}
        yAxisLabel=""
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        segments={3}
        fromZero
      />
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
  chart: {
    marginLeft: -16,
    borderRadius: 16,
  },
});

export default TrendLineChart;
