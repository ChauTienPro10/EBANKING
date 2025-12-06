import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../../constants/color';
import {
  STATUS_OPTIONS,
  StatusFilter as StatusFilterType,
} from '../../types/filterTypes';

interface StatusFilterProps {
  selectedStatus: StatusFilterType;
  onSelectStatus: (status: StatusFilterType) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onSelectStatus,
}) => {
  const isSelected = (label: string) => selectedStatus.label === label;

  return (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Trạng thái</Text>
      <View style={styles.gridContainer}>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.label}
            style={[
              styles.gridItem,
              isSelected(option.label) && styles.gridItemActive,
            ]}
            onPress={() => onSelectStatus(option)}
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
    </View>
  );
};

export default StatusFilter;

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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.main_bule,
    textAlign: 'center',
  },
});
