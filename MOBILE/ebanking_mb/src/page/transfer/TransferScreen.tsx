import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Colors from '../../constants/color';
import CustomButton from '../../components/CustomButton';
import { Header } from '../../components';
import ConfirmTransferModal from '../../popups/ConfirmTransferModal';
import EKYCRequiredModal from '../../components/EKYCRequiredModal';
import PinRequiredModal from '../../components/PinRequiredModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { RootState, AppDispatch, store } from '../../store';
import { fetchUserInfo } from '../../store/fetchAPI/UserInfoFetch';

// Import types
import { TransferParams, SavedAccount } from './types/transfer.types';

// Import constants
import { vietnamBanks } from './constants/banks';

// Import utils
import { genFormData } from './utils/transfer.utils';

// Import hooks
import { useTransferForm } from './hooks/useTransferForm';
import { useTransferValidation } from './hooks/useTransferValidation';
import { useSavedAccounts } from './hooks/useSavedAccounts';
import { useTransferSubmit } from './hooks/useTransferSubmit';

// Import components
import TransferTypeSelector from './components/TransferTypeSelector';
import BankSelector from './components/BankSelector';
import RecipientAccountInput from './components/RecipientAccountInput';
import AmountInput from './components/AmountInput';
import ContentInput from './components/ContentInput';
import BankSelectionModal from './components/BankSelectionModal';
import SavedAccountsModal from './components/SavedAccountsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transfer'>;

const TransferScreen: React.FC<{ route: { params: TransferParams } }> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const dispatch: AppDispatch = store.dispatch;
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const pinStatus = useSelector((state: RootState) => state.app.pinStatus);

  // Fetch latest user info on mount to ensure eKYC status is up-to-date
  useEffect(() => {
    if (loginResponse?.id) {
      dispatch(fetchUserInfo(loginResponse.id));
    }
  }, []);

  // Check PIN status
  const [showPinModal, setShowPinModal] = useState(false);
  useEffect(() => {
    if (pinStatus === false) {
      setShowPinModal(true);
    }
  }, [pinStatus]);

  // Custom hooks
  const {
    formData,
    errors,
    handleInputChange,
    handleAmountChange,
    handleBankSelect,
    setFormErrors,
  } = useTransferForm(route.params);
  const { validateForm } = useTransferValidation();
  const { savedAccounts, saveRecipientAccountToStorage, deleteSavedAccount } =
    useSavedAccounts();
  const {
    isLoading,
    receiverName,
    transferModalVisible,
    showEKYCModal,
    setShowEKYCModal,
    handleTransfer,
    handleConfirmTransfer,
    handleCancelTransfer,
  } = useTransferSubmit();

  // Local UI state
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSavedAccountsModal, setShowSavedAccountsModal] = useState(false);
  const [saveRecipientAccount, setSaveRecipientAccount] = useState(false);
  const [faceAuthSessionId, setFaceAuthSessionId] = useState<string | null>(
    null,
  );
  // const [requiresFaceAuth, setRequiresFaceAuth] = useState(false);
  // const [showEKYCModal, setShowEKYCModal] = useState(false);

  // Handlers
  const onTransferPress = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    handleTransfer(
      formData,
      navigation,
      () => Object.keys(errors).length === 0,
    );
  };

  const onConfirmPress = (pin: string) => {
    handleConfirmTransfer(
      pin,
      formData,
      navigation,
      saveRecipientAccount,
      saveRecipientAccountToStorage,
    );
  };

  const handleSelectSavedAccount = (account: SavedAccount) => {
    handleInputChange('recipientAccount', account.accountNumber);
    setShowSavedAccountsModal(false);
  };

  return (
    <View style={styles.container}>
      <Header title={t('transfer.title')} showBackButton={true} />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
      >
        <TransferTypeSelector
          transferType={formData.transferType}
          onTypeChange={type => handleInputChange('transferType', type)}
        />

        {formData.transferType === 'external' && (
          <BankSelector
            selectedBank={formData.selectedBank}
            onPress={() => setShowBankModal(true)}
          />
        )}

        <RecipientAccountInput
          value={formData.recipientAccount}
          onChange={value => handleInputChange('recipientAccount', value)}
          error={errors.recipientAccount}
          saveRecipient={saveRecipientAccount}
          onSaveChange={setSaveRecipientAccount}
          hasSavedAccounts={savedAccounts.length > 0}
          onShowSavedAccounts={() => setShowSavedAccountsModal(true)}
        />

        <AmountInput
          value={formData.amount}
          onChange={handleAmountChange}
          error={errors.amount}
        />

        <ContentInput
          value={formData.content}
          onChange={value => handleInputChange('content', value)}
          error={errors.content}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('transfer.transfer_button')}
            onPress={onTransferPress}
            loading={isLoading}
            disabled={isLoading}
            size="large"
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Modals */}
      <BankSelectionModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        banks={vietnamBanks}
        selectedBank={formData.selectedBank}
        onSelectBank={handleBankSelect}
      />

      <SavedAccountsModal
        visible={showSavedAccountsModal}
        onClose={() => setShowSavedAccountsModal(false)}
        savedAccounts={savedAccounts}
        onSelectAccount={handleSelectSavedAccount}
        onDeleteAccount={deleteSavedAccount}
      />

      <ConfirmTransferModal
        visible={transferModalVisible}
        data={genFormData(formData, receiverName)}
        onConfirm={onConfirmPress}
        onCancel={handleCancelTransfer}
      />



      {/* eKYC Required Modal */}
      <EKYCRequiredModal
        visible={showEKYCModal}
        onClose={() => setShowEKYCModal(false)}
        onGoToEKYC={() => {
          setShowEKYCModal(false);
          (navigation as any).navigate('Profile');
        }}
        amount={formData.amount}
      />

      <PinRequiredModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          navigation.navigate('Home');
        }}
        onGoToSetPin={() => {
          setShowPinModal(false);
          (navigation as any).navigate('SetPINCode');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default TransferScreen;
