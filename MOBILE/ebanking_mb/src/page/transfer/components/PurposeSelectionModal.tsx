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
import Colors from '../../../constants/color';
import { TransferPurpose } from '../types/transfer.types';

interface PurposeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  purposes: TransferPurpose[];
  selectedPurpose?: TransferPurpose;
  onSelectPurpose: (purpose: TransferPurpose) => void;
  loading?: boolean;
}

const PurposeSelectionModal: React.FC<PurposeSelectionModalProps> = ({
  visible,
  onClose,
  purposes,
  selectedPurpose,
  onSelectPurpose,
  loading = false,
}) => {
  const { t } = useTranslation();

  const renderPurposeItem = ({ item }: { item: TransferPurpose }) => (
    <TouchableOpacity
      style={[
        styles.purposeItem,
        selectedPurpose?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => {
        onSelectPurpose(item);
        onClose();
      }}
    >
      <View style={styles.purposeContent}>
        {item.icon && <Text style={styles.purposeIcon}>{item.icon}</Text>}
        <Text style={[
          styles.purposeName,
          selectedPurpose?.id === item.id && styles.selectedText,
        ]}>
          {item.name}
        </Text>
      </View>
      {selectedPurpose?.id === item.id && (
        <Text style={styles.checkmark}>✓</Text>
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
            <Text style={styles.title}>{t('transfer.select_purpose')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={purposes}
              keyExtractor={(item) => item.id}
              renderItem={renderPurposeItem}
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
  closeText: {
    fontSize: 18,
    color: Colors.text,
  },
  list: {
    paddingHorizontal: 20,
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  selectedItem: {
    backgroundColor: Colors.lightBlue,
  },
  purposeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  purposeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  purposeName: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
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

export default PurposeSelectionModal;