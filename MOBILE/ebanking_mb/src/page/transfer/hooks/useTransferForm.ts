import { useState, useEffect } from 'react';
import {
  Bank,
  FormErrors,
  TransferFormData,
  TransferParams,
  TransferPurpose,
} from '../types/transfer.types';
import { formatAmount } from '../utils/transfer.utils';
import { CardIcon } from '../../../components/icon';

export const useTransferForm = (initialParams?: TransferParams) => {
  const [formData, setFormData] = useState<TransferFormData>({
    recipientAccount: '',
    amount: '',
    content: 'Chuyển tiền',
    transferType: 'internal',
    selectedBank: undefined,
    purpose: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (
      initialParams?.receiver !== null &&
      initialParams?.receiver !== undefined &&
      initialParams?.receiver !== ''
    ) {
      handleInputChange('recipientAccount', initialParams.receiver);

      // Only set amount if it's provided
      if (initialParams.amount) {
        handleAmountChange(initialParams.amount);
      }

      // Only set content if it's provided
      if (initialParams.content) {
        handleInputChange('content', initialParams.content);
      }

      if (
        initialParams.bankCode !== null &&
        initialParams.bankCode !== undefined &&
        initialParams.bankCode !== ''
      ) {
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

  const handleInputChange = (
    field: keyof TransferFormData,
    value: string | 'internal' | 'external' | Bank | TransferPurpose,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    handleInputChange('amount', formatted);
  };

  const handleBankSelect = (bank: Bank) => {
    setFormData(prev => ({ ...prev, selectedBank: bank }));
  };

  const handlePurposeSelect = (purpose: TransferPurpose) => {
    setFormData(prev => ({ ...prev, purpose }));
  };

  const handleCategorySelect = (
    category: import('../../../types/SpendingCategory.types').SpendingCategory,
  ) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const setFormErrors = (newErrors: FormErrors) => {
    setErrors(newErrors);
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleAmountChange,
    handleBankSelect,
    handlePurposeSelect,
    handleCategorySelect,
    setFormErrors,
    setFormData,
  };
};
