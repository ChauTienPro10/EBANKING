import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { SpendingCategory } from '../../../types/SpendingCategory.types';

interface CategorySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  categories: SpendingCategory[];
  selectedCategory?: SpendingCategory;
  onSelectCategory: (category: SpendingCategory) => void;
  loading?: boolean;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  loading = false,
}) => {
  const { t } = useTranslation();

  // Map icon names to Ionicons
  const getIconName = (icon: string): string => {
    const iconMap: Record<string, string> = {
      shop: 'cart-outline',
      food: 'restaurant-outline',
      cart: 'cart-outline',
      play: 'game-controller-outline',
      book: 'book-outline',
      medkit: 'medkit-outline',
      car: 'car-outline',
      document: 'document-text-outline',
      'ellipsis-horizontal': 'ellipsis-horizontal-outline',
    };
    return iconMap[icon] || 'pricetag-outline';
  };

  const renderCategoryItem = ({ item }: { item: SpendingCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => {
        onSelectCategory(item);
        onClose();
      }}
    >
      <View style={styles.categoryContent}>
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}
        >
          <Ionicons
            name={getIconName(item.icon)}
            size={20}
            color={item.color}
          />
        </View>
        <Text
          style={[
            styles.categoryName,
            selectedCategory?.id === item.id && styles.selectedText,
          ]}
        >
          {item.name}
        </Text>
      </View>
      {selectedCategory?.id === item.id && (
        <Ionicons name="checkmark" size={20} color={Colors.main_bule} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('transfer.select_category') || 'Chọn danh mục'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.main_bule} />
              <Text style={styles.loadingText}>
                {t('common.loading') || 'Đang tải...'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={renderCategoryItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedItem: {
    backgroundColor: Colors.background_light,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedText: {
    color: Colors.main_bule,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text,
  },
});

export default CategorySelectionModal;
