import { useTranslation } from 'react-i18next';
import { FormErrors, TransferFormData } from '../types/transfer.types';

export const useTransferValidation = () => {
  const { t } = useTranslation();

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

    if (numericAmount < 1000) {
      return t('transfer.validation.amount_minimum');
    }

    if (numericAmount > 1000000000) {
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

  const validateForm = (formData: TransferFormData): FormErrors => {
    const newErrors: FormErrors = {};

    const accountError = validateAccountNumber(formData.recipientAccount);
    if (accountError) newErrors.recipientAccount = accountError;

    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;

    const contentError = validateContent(formData.content);
    if (contentError) newErrors.content = contentError;

    return newErrors;
  };

  return {
    validateAccountNumber,
    validateAmount,
    validateContent,
    validateForm,
  };
};
