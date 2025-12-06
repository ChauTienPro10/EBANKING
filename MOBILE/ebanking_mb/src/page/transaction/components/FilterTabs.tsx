import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Colors from '../../../constants/color';

export type FilterTab = 'ALL' | 'INCOMING' | 'OUTGOING' | 'PENDING';

interface FilterTabsProps {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'INCOMING', label: 'Thu vào' },
    { key: 'OUTGOING', label: 'Gửi đi' },
    { key: 'PENDING', label: 'Đang xử lý' },
  ];

  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => onFilterChange(tab.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === tab.key && styles.filterTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FilterTabs;

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 4,
  },
  filterTabActive: {
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: Colors.main_bule,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: Colors.main_bule,
    fontWeight: '600',
  },
});
