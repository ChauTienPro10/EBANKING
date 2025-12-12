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
import { ArrowLeftIcon, PersonIcon, ListIcon } from '../../../components/icon';
import { SavedAccount } from '../types/transfer.types';

interface SavedAccountsModalProps {
  visible: boolean;
  onClose: () => void;
  savedAccounts: SavedAccount[];
  onSelectAccount: (account: SavedAccount) => void;
  onDeleteAccount: (accountNumber: string) => void;
}

const SavedAccountsModal: React.FC<SavedAccountsModalProps> = ({
  visible,
  onClose,
  savedAccounts,
  onSelectAccount,
  onDeleteAccount,
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
          <Text style={styles.modalTitle}>{t('transfer.saved_accounts')}</Text>
        </View>

        {savedAccounts.length === 0 ? (
          <View style={styles.emptySavedAccountsContainer}>
            <ListIcon size={64} color={Colors.grey3} />
            <Text style={styles.emptySavedAccountsText}>
              {t('transfer.no_saved_accounts')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedAccounts}
            keyExtractor={item => item.accountNumber}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.savedAccountItem}
                onPress={() => onSelectAccount(item)}
              >
                <View style={styles.savedAccountContent}>
                  <View style={styles.savedAccountLeft}>
                    <View style={styles.savedAccountIconContainer}>
                      <PersonIcon size={24} color={Colors.main_bule} />
                    </View>
                    <View style={styles.savedAccountInfo}>
                      <Text style={styles.savedAccountNumber}>
                        {item.accountNumber}
                      </Text>
                      <Text style={styles.savedAccountName} numberOfLines={1}>
                        {item.accountName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteAccount(item.accountNumber)}
                  >
                    <Text style={styles.deleteButtonText}>
                      {t('transfer.delete')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            style={styles.savedAccountList}
          />
        )}
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
  emptySavedAccountsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySavedAccountsText: {
    ...TextStyles.systemLight_12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  savedAccountList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  savedAccountItem: {
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
  savedAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  savedAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedAccountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  savedAccountInfo: {
    flex: 1,
  },
  savedAccountNumber: {
    ...TextStyles.systemBold_16,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: '700',
  },
  savedAccountName: {
    ...TextStyles.systemLight_14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    marginLeft: 12,
  },
  deleteButtonText: {
    ...TextStyles.systemLight_14,
    color: '#FF4444',
    fontWeight: '600',
  },
});

export default SavedAccountsModal;
