import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/color';
import { translateDynamicText } from '../../utils/translationHelpers';
import {SpendingCategoryService} from '../../services/SpendingCategoryService';
import { SpendingCategory } from '../../types/SpendingCategory.types';
import CategoryCard from './components/CategoryCard';
import CategoryFormModal from './components/CategoryFormModal';

const CategoryManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<SpendingCategory | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await SpendingCategoryService.getUserCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleEditCategory = (category: SpendingCategory) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleDeleteCategory = (category: SpendingCategory) => {
    if (category.isDefault) {
      Alert.alert(
        translateDynamicText('Không thể xóa'),
        translateDynamicText('Không thể xóa danh mục mặc định'),
      );
      return;
    }

    Alert.alert(
      translateDynamicText('Xóa danh mục'),
      translateDynamicText('Bạn có chắc muốn xóa danh mục này?'),
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await SpendingCategoryService.deleteCategory(category.id);
              Alert.alert(
                'Thành công',
                translateDynamicText('Đã xóa danh mục'),
              );
              loadCategories();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa danh mục');
            }
          },
        },
      ],
    );
  };

  const handleFormSubmit = async () => {
    setShowFormModal(false);
    await loadCategories();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {translateDynamicText('Quản lý danh mục')}
        </Text>
        <TouchableOpacity onPress={handleAddCategory} style={styles.addButton}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={80}
            color={Colors.gray_light}
          />
          <Text style={styles.emptyTitle}>
            {translateDynamicText('Chưa có danh mục nào')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {translateDynamicText('Tạo danh mục đầu tiên')}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddCategory}
          >
            <Text style={styles.createButtonText}>Tạo danh mục</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.main_bule}
            />
          }
        >
          <View style={styles.categoryList}>
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEditCategory(category)}
                onDelete={() => handleDeleteCategory(category)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {categories.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddCategory}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Form Modal */}
      <CategoryFormModal
        visible={showFormModal}
        category={editingCategory}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.main_bule,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text_dark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  categoryList: {
    padding: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.main_bule,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CategoryManagementScreen;
