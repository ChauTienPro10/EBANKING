import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { CategoryStatistics } from '../../../types/SpendingCategory.types';
import { translateDynamicText } from '../../../utils/translationHelpers';

interface CategoryStatsCardProps {
  category: CategoryStatistics;
  totalAmount: number;
  onPress: () => void;
}

const CategoryStatsCard: React.FC<CategoryStatsCardProps> = ({
  category,
  totalAmount,
  onPress,
}) => {
  const percentage =
    totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={category.categoryIcon as any}
            size={24}
            color={category.categoryColor}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {translateDynamicText(category.categoryName)}
          </Text>
          <Text style={styles.transactions}>
            {category.transactionCount} giao dịch
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {category.totalAmount.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: category.categoryColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text_dark,
    marginBottom: 4,
  },
  transactions: {
    fontSize: 12,
    color: Colors.gray,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text_dark,
    marginBottom: 2,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.background_light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default CategoryStatsCard;
