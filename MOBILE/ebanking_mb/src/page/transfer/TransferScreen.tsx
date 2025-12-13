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
import Colors from '../../constants/color';
import TextStyles from '../../constants/textStyle';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { Header } from '../../components';
import {
  ArrowLeftIcon,
  UserIcon,
  DollarSignIcon,
  MessageSquareIcon,
  CreditCardIcon,
  SearchIcon,
  CheckIcon,
  ChevronDownIcon,
  CardIcon,
  PeopleIcon,
  PersonIcon,
  CashIcon,
  BusinessIcon,
  TrendingUpIcon,
  ShieldIcon,
  CrownIcon,
  StarIcon,
  AirplaneIcon,
  ListIcon,
} from '../../components/icon';
import ConfirmTransferModal from '../../popups/ConfirmTransferModal';
import EKYCRequiredModal from '../../components/EKYCRequiredModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import Toast from 'react-native-toast-message';
import { checkFaceAuthRequired } from '../../services/faceAuthApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import TransactionFailedScreen from './Error';
import { AppDispatch, store } from '../../store';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';
import CheckBox from '../../components/CheckBox';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transfer' // hoặc màn hình hiện tại bạn đang ở
>;

interface Bank {
  id: string;
  name: string;
  code: string;
  logo?: React.ComponentType<{ size?: number; color?: string }>;
}

const transferData = {
  'Số tiền': 1000000,
  'Tài khoản nhận': '123456789',
  'Tên người nhận': 'Nguyễn Văn A',
  'Nội dung': 'Chuyển tiền học phí',
};

const genFormData = (formData: TransferFormData, fullName: string) => {
  return {
    'Số tiền': formData.amount,
    'Tài khoản nhận': formData.recipientAccount,
    'Tên người nhận': fullName,
    'Nội dung': formData.content,
  };
};
interface TransferParams {
  receiver: string;
  amount: string;
  content: string;
  bankCode: string;
}

interface TransferFormData {
  recipientAccount: string;
  amount: string;
  content: string;
  transferType: 'internal' | 'external';
  selectedBank?: Bank;
}

interface FormErrors {
  recipientAccount?: string;
  amount?: string;
  content?: string;
}

interface SavedAccount {
  accountNumber: string;
  accountName: string;
  savedAt: number;
}

const STORAGE_KEY = 'saved_recipient_accounts';

const TransferScreen: React.FC<{ route: { params: TransferParams } }> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  const { receiver, amount, content, bankCode } = route.params;
  const { t } = useTranslation();
  const [accountOk, setAccountOk] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [saveRecipientAccount, setSaveRecipientAccount] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showSavedAccountsModal, setShowSavedAccountsModal] = useState(false);
  const [faceAuthSessionId, setFaceAuthSessionId] = useState<string | null>(
    null,
  );
  const [requiresFaceAuth, setRequiresFaceAuth] = useState(false);
  const [showEKYCModal, setShowEKYCModal] = useState(false);

  const dispatch: AppDispatch = store.dispatch;

  const loadSavedAccounts = async () => {
    try {
      const accountsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (accountsJson) {
        const accounts: SavedAccount[] = JSON.parse(accountsJson);
        setSavedAccounts(accounts);
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    }
  };

  useEffect(() => {
    loadSavedAccounts();
  }, []);

  useEffect(() => {
    if (receiver !== null && receiver !== undefined && receiver !== '') {
      // goi api kiem tra thong tin so tai khoan
      handleInputChange('recipientAccount', receiver);
      handleAmountChange(amount);
      handleInputChange('content', content);
      if (bankCode !== null && bankCode !== undefined && bankCode !== '') {
        handleBankSelect({
          id: '1',
          name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
          code: 'VCB',
          logo: CardIcon,
        });
        setFormData(prev => ({ ...prev, transferType: 'external' }));
      }
    }
  }, []);

  const onCheckAccountNumberSuccess = (fullName: string) => {
    setReceiverName(fullName);
    setTransferModalVisible(true);
  };

  const handleConfirmTransfer = async (pin: string) => {
    try {
      const payload = {
        pin: pin,
        username: loginResponse?.username,
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: formData.recipientAccount,
        amount: formData.amount.replace(/,/g, ''),
        currency: 'VND',
        transactionType: 'TRANSFER',
        description: formData.content,
        // NEW: Add face auth fields
        requiresFaceAuth: requiresFaceAuth,
        faceAuthSessionId: faceAuthSessionId,
      };

      const transferResponse = await fetch.post(API.TRANSFER, payload);

      if (transferResponse?.transactionId) {
        if (loginResponse?.id !== undefined) {
          dispatch(fetchAccountTransInfo(loginResponse.id));
        }

        // Lưu số tài khoản người nhận nếu checkbox được chọn
        if (saveRecipientAccount && formData.recipientAccount) {
          await saveRecipientAccountToStorage(
            formData.recipientAccount,
            receiverName,
          );
        }

        // Reset face auth state
        setRequiresFaceAuth(false);
        setFaceAuthSessionId(null);

        navigation.navigate('PendingTransactionScreen', {
          amount: '₫' + formData.amount,
          content: formData?.content,
          date: new Date().toISOString(),
          receiverName: receiverName,
        });
      } else {
        navigation.navigate('TransactionFailedScreen');
      }
    } catch (error: any) {
      const extractedMessage = error.toString().split(':')[2] || error;
      navigation.navigate('TransactionFailedScreen', {
        errorString: extractedMessage,
      });
    } finally {
      setTransferModalVisible(false);
      setIsLoading(false); // Reset loading state
    }
  };

  const handleCancelTransfer = async () => {
    setTransferModalVisible(false);
  };

  const saveRecipientAccountToStorage = async (
    accountNumber: string,
    accountName: string,
  ) => {
    try {
      const existingAccountsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingAccounts: SavedAccount[] = existingAccountsJson
        ? JSON.parse(existingAccountsJson)
        : [];

      // Kiểm tra xem tài khoản đã tồn tại chưa
      const existingIndex = existingAccounts.findIndex(
        acc => acc.accountNumber === accountNumber,
      );

      const newAccount: SavedAccount = {
        accountNumber,
        accountName,
        savedAt: Date.now(),
      };

      if (existingIndex >= 0) {
        // Cập nhật tài khoản đã tồn tại
        existingAccounts[existingIndex] = newAccount;
      } else {
        // Thêm tài khoản mới
        existingAccounts.unshift(newAccount);
        // Giới hạn tối đa 20 tài khoản đã lưu
        if (existingAccounts.length > 20) {
          existingAccounts.pop();
        }
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingAccounts));
      setSavedAccounts(existingAccounts);
    } catch (error) {
      console.error('Error saving recipient account:', error);
    }
  };

  const deleteSavedAccount = async (accountNumber: string) => {
    try {
      const updatedAccounts = savedAccounts.filter(
        acc => acc.accountNumber !== accountNumber,
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
      setSavedAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error deleting saved account:', error);
    }
  };

  const handleSelectSavedAccount = (account: SavedAccount) => {
    handleInputChange('recipientAccount', account.accountNumber);
    setReceiverName(account.accountName);
    setShowSavedAccountsModal(false);
  };

  const [formData, setFormData] = useState<TransferFormData>({
    recipientAccount: '',
    amount: '',
    content: 'Chuyển tiền',
    transferType: 'internal',
    selectedBank: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const vietnamBanks: Bank[] = [
    {
      id: '1',
      name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
      code: 'VCB',
      logo: CardIcon,
    },
    {
      id: '2',
      name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)',
      code: 'CTG',
      logo: BusinessIcon,
    },
    {
      id: '3',
      name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
      code: 'BID',
      logo: TrendingUpIcon,
    },
    {
      id: '4',
      name: 'Ngân hàng TMCP Quân đội (MB)',
      code: 'MBB',
      logo: ShieldIcon,
    },
    {
      id: '5',
      name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
      code: 'TCB',
      logo: CreditCardIcon,
    },
    {
      id: '6',
      name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)',
      code: 'VPB',
      logo: CrownIcon,
    },
    {
      id: '7',
      name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)',
      code: 'STB',
      logo: StarIcon,
    },
    {
      id: '8',
      name: 'Ngân hàng TMCP Á Châu (ACB)',
      code: 'ACB',
      logo: CardIcon,
    },
    {
      id: '9',
      name: 'Ngân hàng TMCP Hàng Hải (MSB)',
      code: 'MSB',
      logo: AirplaneIcon,
    },
    {
      id: '10',
      name: 'Ngân hàng TMCP Tiên Phong (TPBank)',
      code: 'TPB',
      logo: TrendingUpIcon,
    },
    {
      id: '11',
      name: 'Ngân hàng TMCP Phương Đông (OCB)',
      code: 'OCB',
      logo: StarIcon,
    },
    {
      id: '12',
      name: 'Ngân hàng TMCP Sài Gòn (SCB)',
      code: 'SCB',
      logo: BusinessIcon,
    },
    {
      id: '13',
      name: 'Ngân hàng TMCP An Bình (ABBANK)',
      code: 'ABB',
      logo: ShieldIcon,
    },
    {
      id: '14',
      name: 'Ngân hàng TMCP Bảo Việt (BAOVIETBANK)',
      code: 'BVB',
      logo: ShieldIcon,
    },
    {
      id: '15',
      name: 'Ngân hàng TMCP Bắc Á (BAB)',
      code: 'BAB',
      logo: TrendingUpIcon,
    },
    {
      id: '16',
      name: 'Ngân hàng TMCP Việt Á (VAB)',
      code: 'VAB',
      logo: StarIcon,
    },
    {
      id: '17',
      name: 'Ngân hàng TMCP Nam Á (NAB)',
      code: 'NAB',
      logo: StarIcon,
    },
    {
      id: '18',
      name: 'Ngân hàng TMCP Quốc Dân (NCB)',
      code: 'NCB',
      logo: PeopleIcon,
    },
    {
      id: '19',
      name: 'Ngân hàng TMCP Đông Nam Á (SeABank)',
      code: 'SSB',
      logo: TrendingUpIcon,
    },
    {
      id: '20',
      name: 'Ngân hàng TMCP Bản Việt (VietCapitalBank)',
      code: 'VCC',
      logo: BusinessIcon,
    },
  ];

  const filteredBanks = vietnamBanks;

  const validateAccountNumber = (account: string): string | undefined => {
    if (!account.trim()) {
      return t('transfer.validation.account_required');
    }
    if (!/^\d{10,16}$/.test(account.replace(/\s/g, ''))) {
      return t('transfer.validation.account_invalid');
    }
    return undefined;
  };

  const validateAmount = (amount: string): string | undefined => {
    if (!amount.trim()) {
      return t('transfer.validation.amount_required');
    }

    const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return t('transfer.validation.amount_invalid');
    }

    if (numericAmount < 10000) {
      return t('transfer.validation.amount_minimum');
    }

    if (numericAmount > 500000000) {
      return t('transfer.validation.amount_maximum');
    }

    return undefined;
  };

  const validateContent = (content: string): string | undefined => {
    if (!content.trim()) {
      return t('transfer.validation.content_required');
    }

    if (content.length > 200) {
      return t('transfer.validation.content_too_long');
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const accountError = validateAccountNumber(formData.recipientAccount);
    if (accountError) newErrors.recipientAccount = accountError;

    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;

    const contentError = validateContent(formData.content);
    if (contentError) newErrors.content = contentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatAmount = (text: string) => {
    const numericValue = text.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    handleInputChange('amount', formatted);
  };

  const handleBankSelect = (bank: Bank) => {
    setFormData(prev => ({ ...prev, selectedBank: bank }));
    setShowBankModal(false);
  };

  const handleTransfer = async () => {
    if (!validateForm()) {
      return;
    }

    if (formData.transferType === 'external' && !formData.selectedBank) {
      Alert.alert(
        t('transfer.error.title'),
        t('transfer.validation.bank_required'),
      );
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Check if face authentication is required
      const faceAuthCheck = await checkFaceAuthRequired(
        loginResponse?.id!,
        loginResponse?.username!,
        formData.amount,
      );

      if (faceAuthCheck.required) {
        // Check eKYC status before allowing face auth
        const amountNum = parseFloat(formData.amount.replace(/,/g, ''));
        if (amountNum > 10000000) {
          // Check if user has completed eKYC
          const ekycStatus = loginResponse?.ekycStatus;

          if (!ekycStatus || ekycStatus !== 'VERIFIED') {
            setIsLoading(false);
            setShowEKYCModal(true);
            return;
          }
        }

        setIsLoading(false);
        setRequiresFaceAuth(true);

        // Navigate to Face Auth Screen with sessionId
        (navigation as any).navigate('FaceAuthScreen', {
          reason: faceAuthCheck.reason,
          amount: formData.amount,
          sessionId: faceAuthCheck.sessionId, // Pass sessionId from check-face-auth
          onSuccess: (sessionId: string) => {
            setFaceAuthSessionId(sessionId);
            // Continue with account check after face auth success
            proceedWithAccountCheck();
          },
        });
        return;
      }

      // No face auth required, proceed normally
      setRequiresFaceAuth(false);
      setFaceAuthSessionId(null);
      await proceedWithAccountCheck();
    } catch (error: any) {
      Alert.alert(
        t('transfer.error.title'),
        error.message || t('transfer.error.message'),
      );
      setIsLoading(false);
    }
  };

  const proceedWithAccountCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch.post(API.CHECK_ACCOUNT_NUMBER, {
        accountNumber: formData.recipientAccount,
      });
      if (response?.isExist) {
        onCheckAccountNumberSuccess(response?.fullName);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Giao dịch thất bại',
          text2: 'Tài khoản không tồn tại!',
        });
      }
    } catch (error) {
      Alert.alert(t('transfer.error.title'), t('transfer.error.message'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = ['100,000', '500,000', '1,000,000', '5,000,000'];

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
        <View style={styles.section}>
          <ConfirmTransferModal
            visible={transferModalVisible}
            data={genFormData(formData, receiverName)}
            onConfirm={handleConfirmTransfer}
            onCancel={handleCancelTransfer}
          />

          {/* <Text style={styles.sectionTitle}>{t('transfer.transfer_type')}</Text> */}
          <View style={styles.transferTypeContainer}>
            <TouchableOpacity
              style={[
                styles.transferTypeButton,
                formData.transferType === 'internal' &&
                  styles.transferTypeButtonActive,
              ]}
              onPress={() =>
                setFormData(prev => ({ ...prev, transferType: 'internal' }))
              }
            >
              <CardIcon
                size={20}
                color={
                  formData.transferType === 'internal'
                    ? Colors.white
                    : Colors.main_bule
                }
              />
              <Text
                style={[
                  styles.transferTypeText,
                  formData.transferType === 'internal' &&
                    styles.transferTypeTextActive,
                ]}
              >
                {t('transfer.internal_transfer')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.transferTypeButton,
                formData.transferType === 'external' &&
                  styles.transferTypeButtonActive,
              ]}
              onPress={() =>
                setFormData(prev => ({ ...prev, transferType: 'external' }))
              }
            >
              <PeopleIcon
                size={20}
                color={
                  formData.transferType === 'external'
                    ? Colors.white
                    : Colors.main_bule
                }
              />
              <Text
                style={[
                  styles.transferTypeText,
                  formData.transferType === 'external' &&
                    styles.transferTypeTextActive,
                ]}
              >
                {t('transfer.external_transfer')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {formData.transferType === 'external' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('transfer.select_bank')}</Text>
            <TouchableOpacity
              style={styles.bankSelector}
              onPress={() => setShowBankModal(true)}
            >
              <View style={styles.bankSelectorContent}>
                <View style={styles.bankSelectorLeft}>
                  {formData.selectedBank?.logo && (
                    <View style={styles.bankSelectorLogoContainer}>
                      {React.createElement(formData.selectedBank.logo, {
                        size: 20,
                        color: Colors.main_bule,
                      })}
                    </View>
                  )}
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankCode}>
                      {formData.selectedBank?.code || '---'}
                    </Text>
                    <Text style={styles.bankName} numberOfLines={1}>
                      {formData.selectedBank?.name ||
                        t('transfer.select_bank_placeholder')}
                    </Text>
                  </View>
                </View>
                <ChevronDownIcon size={20} color={Colors.grey3} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.recipientAccountHeader}>
            {/* <Text style={styles.sectionTitle}>{t('transfer.recipient_account')}</Text> */}
            {savedAccounts.length > 0 && (
              <TouchableOpacity
                style={styles.savedAccountsButton}
                onPress={() => setShowSavedAccountsModal(true)}
              >
                {/* <ListIcon size={20} color={Colors.main_bule} /> */}
                <Text style={styles.savedAccountsButtonText}>
                  {t('transfer.saved_accounts')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <CustomInput
            placeholder={t('transfer.recipient_account_placeholder')}
            value={formData.recipientAccount}
            onChangeText={value => handleInputChange('recipientAccount', value)}
            error={errors.recipientAccount}
            leftIcon={<PersonIcon size={20} color={Colors.grey3} />}
            keyboardType="numeric"
            maxLength={16}
          />
          <View style={styles.saveAccountContainer}>
            <CheckBox
              checked={saveRecipientAccount}
              onChange={setSaveRecipientAccount}
            />
            <Text
              style={styles.saveAccountText}
              onPress={() => setSaveRecipientAccount(!saveRecipientAccount)}
            >
              {t('transfer.save_recipient_account')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <CustomInput
            label={t('transfer.amount')}
            placeholder={t('transfer.amount_placeholder')}
            value={formData.amount}
            onChangeText={handleAmountChange}
            error={errors.amount}
            leftIcon={<CashIcon size={20} color={Colors.grey3} />}
            keyboardType="numeric"
          />

          <View style={styles.quickAmountContainer}>
            <Text style={styles.quickAmountLabel}>
              {t('transfer.quick_amount')}
            </Text>
            <View style={styles.quickAmountButtons}>
              {quickAmounts.map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => handleAmountChange(amount)}
                >
                  <Text style={styles.quickAmountText}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <CustomInput
            label={t('transfer.content')}
            placeholder={t('transfer.content_placeholder')}
            value={formData.content}
            onChangeText={value => handleInputChange('content', value)}
            error={errors.content}
            leftIcon={<MessageSquareIcon size={20} color={Colors.grey3} />}
            multiline
            numberOfLines={3}
            maxLength={200}
            style={styles.contentInput}
          />
          <Text style={styles.characterCount}>
            {formData.content.length}/200
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('transfer.transfer_button')}
            onPress={handleTransfer}
            loading={isLoading}
            disabled={isLoading}
            size="large"
          />
        </View>
      </KeyboardAwareScrollView>

      <Modal
        visible={showBankModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBankModal(false)}
            >
              <ArrowLeftIcon size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('transfer.select_bank')}</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.bankItem,
                  formData.selectedBank?.id === item.id &&
                    styles.bankItemSelected,
                ]}
                onPress={() => handleBankSelect(item)}
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
                  {formData.selectedBank?.id === item.id && (
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

      <Modal
        visible={showSavedAccountsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSavedAccountsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSavedAccountsModal(false)}
            >
              <ArrowLeftIcon size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t('transfer.saved_accounts')}
            </Text>
            {/* <View style={styles.modalHeaderRight} /> */}
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
                  onPress={() => handleSelectSavedAccount(item)}
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
                      onPress={() => deleteSavedAccount(item.accountNumber)}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...TextStyles.systemBold_18,
    color: Colors.textPrimary,
    marginBottom: 18,
    fontWeight: '700',
  },
  transferTypeContainer: {
    marginTop: 10,
    marginBottom: -15,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 6,
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
  transferTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  transferTypeButtonActive: {
    backgroundColor: Colors.main_bule,
  },
  transferTypeText: {
    ...TextStyles.systemLight_14,
    color: Colors.main_bule,
    marginLeft: 8,
    fontWeight: '500',
  },
  transferTypeTextActive: {
    color: Colors.white,
  },
  quickAmountContainer: {
    marginTop: 20,
  },
  quickAmountLabel: {
    ...TextStyles.systemLight_14,
    color: Colors.textSecondary,
    marginBottom: 14,
    fontWeight: '500',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAmountText: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  contentInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    ...TextStyles.systemLight_12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 36,
    marginBottom: 40,
  },
  // bank selection styles
  bankSelector: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bankSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankSelectorLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankCode: {
    ...TextStyles.systemBold_16,
    color: Colors.main_bule,
    marginBottom: 4,
    fontWeight: '700',
  },
  bankName: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
  },
  // modal styles
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
  saveAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  saveAccountText: {
    ...TextStyles.systemLight_14,
    color: Colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  recipientAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // marginBottom: 18,
  },
  savedAccountsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  savedAccountsButtonText: {
    ...TextStyles.systemLight_14,
    color: Colors.main_bule,
    marginLeft: 6,
    fontWeight: '600',
  },
  emptySavedAccountsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 60,
  },
  emptySavedAccountsText: {
    ...TextStyles.systemLight_12,
    color: Colors.textSecondary,
    // marginTop: 16,
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

export default TransferScreen;
