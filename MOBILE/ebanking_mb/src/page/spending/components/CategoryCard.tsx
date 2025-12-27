import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { SpendingCategory } from '../../../types/SpendingCategory.types';
import { translateDynamicText } from '../../../utils/translationHelpers';

interface CategoryCardProps {
  category: SpendingCategory;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  // Map icon names to Ionicons
  const getIconName = (icon: string): string => {
    // If icon already ends with '-outline', it's already an Ionicon name
    if (icon && icon.includes('-outline')) {
      return icon;
    }

    // Otherwise map short names to Ionicon names
    const iconMap: Record<string, string> = {
      shop: 'cart-outline',
      food: 'restaurant-outline',
      cart: 'cart-outline',
      play: 'game-controller-outline',
      book: 'book-outline',
      medkit: 'medkit-outline',
      car: 'car-outline',
      document: 'document-text-outline',
      more: 'ellipsis-horizontal-outline',
      cafe: 'cafe-outline',
    };
    return iconMap[icon] || 'pricetag-outline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: category.color + '20' },
          ]}
        >
          <Ionicons
            name={getIconName(category.icon)}
            size={24}
            color={category.color}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{translateDynamicText(category.name)}</Text>
          <Text style={styles.code}>{category.code}</Text>
        </View>

        {category.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Mặc định</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.main_bule}
            />
          </TouchableOpacity>

          {!category.isDefault && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.colorBar, { backgroundColor: category.color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  code: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'monospace',
  },
  defaultBadge: {
    backgroundColor: Colors.main_bule + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background_light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.danger + '10',
  },
  colorBar: {
    height: 4,
  },
});

export default CategoryCard;
