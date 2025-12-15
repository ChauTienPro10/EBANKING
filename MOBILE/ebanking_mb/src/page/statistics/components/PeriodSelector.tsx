import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimePeriod } from '../utils/statisticsUtils';
import Colors from '../../../constants/color';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  weekLabel: string;
  monthLabel: string;
  yearLabel: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  weekLabel,
  monthLabel,
  yearLabel,
}) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'week', label: weekLabel },
    { value: 'month', label: monthLabel },
    { value: 'year', label: yearLabel },
  ];

  return (
    <View style={styles.container}>
      {periods.map(period => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.tab,
            selectedPeriod === period.value && styles.tabActive,
          ]}
          onPress={() => onPeriodChange(period.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedPeriod === period.value && styles.tabTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.main_bule,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
});

export default PeriodSelector;
