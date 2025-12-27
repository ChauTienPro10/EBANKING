import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { SpendingCategory } from '../../../types/SpendingCategory.types';

interface CategorySelectorProps {
  selectedCategory?: SpendingCategory;
  onPress: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onPress,
}) => {
  const { t } = useTranslation();

  // Map icon names to Ionicons
  const getIconName = (icon: string): string => {
    // If icon already ends with '-outline', it's already an Ionicon name
    if (icon && icon.includes('-outline')) {
      return icon;
    }

    // Otherwise map short names to Ionicon names
    const iconMap: Record<string, string> = {
      // Shopping & Food
      shop: 'bag-outline',
      shopping: 'bag-outline',
      cart: 'cart-outline',
      bag: 'bag-outline',
      food: 'restaurant-outline',
      restaurant: 'restaurant-outline',
      cafe: 'cafe-outline',
      // Transportation
      car: 'car-outline',
      bus: 'bus-outline',
      bicycle: 'bicycle-outline',
      // Bills & Documents
      document: 'document-text-outline',
      receipt: 'receipt-outline',
      bill: 'receipt-outline',
      invoice: 'receipt-outline',
      // Entertainment
      play: 'game-controller-outline',
      game: 'game-controller-outline',
      movie: 'film-outline',
      music: 'musical-notes-outline',
      // Education & Health
      book: 'book-outline',
      education: 'school-outline',
      medkit: 'medkit-outline',
      health: 'fitness-outline',
      // Other
      more: 'ellipsis-horizontal-outline',
      other: 'ellipsis-horizontal-outline',
      'ellipsis-horizontal': 'ellipsis-horizontal-outline',
    };
    return iconMap[icon] || 'pricetag-outline';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {t('transfer.category_label') || 'Danh mục chi tiêu'}
      </Text>
      <TouchableOpacity style={styles.selector} onPress={onPress}>
        {selectedCategory && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName(selectedCategory.icon)}
              size={20}
              color={selectedCategory.color}
            />
          </View>
        )}
        <Text
          style={[styles.selectorText, !selectedCategory && styles.placeholder]}
        >
          {selectedCategory
            ? selectedCategory.name
            : t('transfer.select_category') || 'Chọn danh mục'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.main_bule} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background_light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.grey1,
  },
});

export default CategorySelector;
