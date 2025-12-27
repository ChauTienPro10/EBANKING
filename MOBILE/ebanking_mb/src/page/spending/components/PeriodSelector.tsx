import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../constants/color';
import { PeriodType } from '../../../types/SpendingCategory.types';
import { translateDynamicText } from '../../../utils/translationHelpers';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const periods: { value: PeriodType; label: string }[] = [
    { value: 'week', label: translateDynamicText('Tuần') },
    { value: 'month', label: translateDynamicText('Tháng') },
    { value: 'year', label: translateDynamicText('Năm') },
  ];

  return (
    <View style={styles.container}>
      {periods.map(period => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            selectedPeriod === period.value && styles.periodButtonActive,
          ]}
          onPress={() => onPeriodChange(period.value)}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === period.value && styles.periodTextActive,
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
    backgroundColor: Colors.background_light,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.main_bule,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
  },
  periodTextActive: {
    color: Colors.white,
  },
});

export default PeriodSelector;
