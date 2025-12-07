import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Colors from '../constants/color';

// Hàm gen mã 12 số
function generateRandomCode(length: number): string {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

// Gen 3 mã
const codes: string[] = Array.from({ length: 3 }, () => generateRandomCode(12));

const types = ['SAVINGS', 'DEVTEST'];

type AccountNumberPickerPopupProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (accountNumber: string, accountType: string) => void;
};

const AccountNumberPickerPopup: React.FC<AccountNumberPickerPopupProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedCode && selectedType) {
      onSelect(selectedCode, selectedType);
      onClose();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn đủ thông tin',
        text2: 'Chọn cả số tài khoản và loại tài khoản',
        props: {
          style: { zIndex: 99999, elevation: 9999 },
        },
      });
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn tài khoản</Text>
            <Text style={styles.subtitle}>
              Vui lòng chọn số tài khoản và loại tài khoản để tiếp tục
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SỐ TÀI KHOẢN</Text>
              {codes.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionItem,
                    selectedCode === item && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedCode(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedCode === item && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
                    <View
                      style={[
                        styles.radio,
                        selectedCode === item && styles.radioSelected,
                      ]}
                    >
                      {selectedCode === item && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>LOẠI TÀI KHOẢN</Text>
              {types.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionItem,
                    selectedType === item && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedType(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedType === item && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
                    <View
                      style={[
                        styles.radio,
                        selectedType === item && styles.radioSelected,
                      ]}
                    >
                      {selectedType === item && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AccountNumberPickerPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    maxHeight: '80%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    padding: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.grey3,
    lineHeight: 18,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 18,
    paddingBottom: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.grey3,
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  optionItem: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: '#E6F7F8',
    borderColor: Colors.main_bule,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  selectedText: {
    color: Colors.main_bule,
    fontWeight: '600',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.main_bule,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.main_bule,
  },
  footer: {
    flexDirection: 'row',
    padding: 18,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.grey3,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
