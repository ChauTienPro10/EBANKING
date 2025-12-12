import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import { ArrowLeftIcon, CheckIcon } from '../../../components/icon';
import { Bank } from '../types/transfer.types';

interface BankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  banks: Bank[];
  selectedBank?: Bank;
  onSelectBank: (bank: Bank) => void;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  visible,
  onClose,
  banks,
  selectedBank,
  onSelectBank,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <ArrowLeftIcon size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('transfer.select_bank')}</Text>
          <View style={styles.modalHeaderRight} />
        </View>

        <FlatList
          data={banks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.bankItem,
                selectedBank?.id === item.id && styles.bankItemSelected,
              ]}
              onPress={() => onSelectBank(item)}
            >
              <View style={styles.bankItemContent}>
                <View style={styles.bankItemLeft}>
                  <View style={styles.bankLogoContainer}>
                    {item.logo &&
                      React.createElement(item.logo, {
                        size: 24,
                        color: Colors.main_bule,
                      })}
                  </View>
                  <View style={styles.bankItemInfo}>
                    <Text style={styles.bankItemCode}>{item.code}</Text>
                    <Text style={styles.bankItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                </View>
                {selectedBank?.id === item.id && (
                  <View style={styles.selectedIndicator}>
                    <CheckIcon size={24} color={Colors.main_bule} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          style={styles.bankList}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    ...TextStyles.systemBold_1,
    color: Colors.textPrimary,
  },
  modalHeaderRight: {
    width: 40,
  },
  bankList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bankItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bankItemSelected: {
    borderColor: Colors.main_bule,
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  bankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bankItemInfo: {
    flex: 1,
  },
  bankItemCode: {
    ...TextStyles.systemBold_16,
    color: Colors.main_bule,
    marginBottom: 4,
    fontWeight: '700',
  },
  bankItemName: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
});

export default BankSelectionModal;
