import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../../constants/color';
import {
  generateTimePeriodOptions,
  getDateRangeForMonth,
  TimePeriodFilter,
} from '../../types/filterTypes';

interface TimeFilterProps {
  showAllMonths: boolean;
  onToggleMonths: () => void;
  selectedPeriod: TimePeriodFilter;
  onSelectPeriod: (period: TimePeriodFilter) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  showAllMonths,
  onToggleMonths,
  selectedPeriod,
  onSelectPeriod,
}) => {
  const allMonths = generateTimePeriodOptions();
  const visibleMonths = showAllMonths ? allMonths : allMonths.slice(0, 5);

  const handleSelectAll = () => {
    onSelectPeriod({
      label: 'Tất cả',
      startDate: null,
      endDate: null,
    });
  };

  const handleSelectMonth = (month: number, year: number, label: string) => {
    const dateRange = getDateRangeForMonth(month, year);
    onSelectPeriod({
      label,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  const isSelected = (label: string) => selectedPeriod.label === label;

  return (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Theo thời gian</Text>
      <View style={styles.gridContainer}>
        {/* Tất cả option */}
        <TouchableOpacity
          style={[
            styles.gridItem,
            isSelected('Tất cả') && styles.gridItemActive,
          ]}
          onPress={handleSelectAll}
        >
          <Text
            style={[
              styles.gridItemText,
              isSelected('Tất cả') && styles.gridItemTextActive,
            ]}
            numberOfLines={1}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {/* Month options */}
        {visibleMonths.map(option => (
          <TouchableOpacity
            key={option.label}
            style={[
              styles.gridItem,
              isSelected(option.label) && styles.gridItemActive,
            ]}
            onPress={() =>
              handleSelectMonth(option.month, option.year, option.label)
            }
          >
            <Text
              style={[
                styles.gridItemText,
                isSelected(option.label) && styles.gridItemTextActive,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.showMoreButton} onPress={onToggleMonths}>
        <Text style={styles.showMoreText}>
          {showAllMonths ? 'Thu gọn ⬆' : 'Xem thêm ⬇'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimeFilter;

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '31.5%',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemActive: {
    borderColor: Colors.main_bule,
    borderWidth: 2,
    backgroundColor: '#F0F9FA',
  },
  gridItemText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  gridItemTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.main_bule,
    textAlign: 'center',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.main_bule,
    fontWeight: '500',
  },
});
