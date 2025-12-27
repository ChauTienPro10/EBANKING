import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { translateDynamicText } from '../../../utils/translationHelpers';
import { SpendingCategoryService } from '../../../services/SpendingCategoryService';
import {
  SpendingCategory,
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_CATEGORY_ICONS,
} from '../../../types/SpendingCategory.types';

interface CategoryFormModalProps {
  visible: boolean;
  category: SpendingCategory | null;
  onClose: () => void;
  onSubmit: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  category,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [icon, setIcon] = useState('pricetag-outline');
  const [color, setColor] = useState('#4ECDC4');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setCode(category.code);
      setIcon(category.icon);
      setColor(category.color);
    } else {
      resetForm();
    }
  }, [category, visible]);

  const resetForm = () => {
    setName('');
    setCode('');
    setIcon('pricetag-outline');
    setColor('#4ECDC4');
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (!category) {
      // Auto-generate code from name
      const generatedCode = SpendingCategoryService.generateCategoryCode(text);
      setCode(generatedCode);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã danh mục');
      return;
    }

    if (!SpendingCategoryService.validateCategoryCode(code)) {
      Alert.alert(
        'Lỗi',
        'Mã danh mục chỉ được chứa chữ cái in hoa và dấu gạch dưới',
      );
      return;
    }

    if (!SpendingCategoryService.validateColor(color)) {
      Alert.alert('Lỗi', 'Màu sắc không hợp lệ');
      return;
    }

    try {
      setLoading(true);

      if (category) {
        // Update existing category
        await SpendingCategoryService.updateCategory(category.id, {
          name: name.trim(),
          icon,
          color,
        });
        Alert.alert('Thành công', translateDynamicText('Đã cập nhật danh mục'));
      } else {
        // Create new category
        await SpendingCategoryService.createCategory({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          icon,
          color,
        });
        Alert.alert(
          'Thành công',
          translateDynamicText('Đã tạo danh mục thành công'),
        );
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text_dark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {category
                ? translateDynamicText('Chỉnh sửa danh mục')
                : translateDynamicText('Tạo danh mục mới')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {translateDynamicText('Tên danh mục')}
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Ví dụ: Cafe, Xăng xe..."
                placeholderTextColor={Colors.gray_light}
                maxLength={100}
              />
            </View>

            {/* Code Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {translateDynamicText('Mã danh mục')}
              </Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={setCode}
                placeholder="CAFE"
                placeholderTextColor={Colors.gray_light}
                maxLength={20}
                autoCapitalize="characters"
                editable={!category} // Can't change code when editing
              />
              {category && (
                <Text style={styles.hint}>Không thể thay đổi mã danh mục</Text>
              )}
            </View>

            {/* Icon Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {translateDynamicText('Biểu tượng')}
              </Text>
              <View style={styles.iconGrid}>
                {DEFAULT_CATEGORY_ICONS.map(iconName => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconButton,
                      icon === iconName && styles.iconButtonSelected,
                    ]}
                    onPress={() => setIcon(iconName)}
                  >
                    <Ionicons
                      name={iconName}
                      size={24}
                      color={icon === iconName ? Colors.main_bule : Colors.gray}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {translateDynamicText('Màu sắc')}
              </Text>
              <View style={styles.colorGrid}>
                {DEFAULT_CATEGORY_COLORS.map(colorOption => (
                  <TouchableOpacity
                    key={colorOption}
                    style={[
                      styles.colorButton,
                      { backgroundColor: colorOption },
                      color === colorOption && styles.colorButtonSelected,
                    ]}
                    onPress={() => setColor(colorOption)}
                  >
                    {color === colorOption && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.white}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Xem trước:</Text>
              <View style={[styles.previewCard, { borderLeftColor: color }]}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: color + '20' },
                  ]}
                >
                  <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>
                    {name || 'Tên danh mục'}
                  </Text>
                  <Text style={styles.previewCode}>{code || 'CODE'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Đang lưu...' : category ? 'Cập nhật' : 'Tạo mới'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text_dark,
  },
  placeholder: {
    width: 32,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text_dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text_dark,
  },
  codeInput: {
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: Colors.main_bule,
    backgroundColor: Colors.main_bule + '10',
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: Colors.text_dark,
  },
  preview: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text_dark,
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background_light,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text_dark,
    marginBottom: 4,
  },
  previewCode: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background_light,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text_dark,
  },
  submitButton: {
    backgroundColor: Colors.main_bule,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default CategoryFormModal;
