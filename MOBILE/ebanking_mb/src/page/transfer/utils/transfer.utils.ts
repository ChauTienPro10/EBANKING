import { TransferFormData } from '../types/transfer.types';

export const STORAGE_KEY = 'saved_recipient_accounts';

export const formatAmount = (text: string): string => {
  const numericValue = text.replace(/[^\d.]/g, '');
  const parts = numericValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const genFormData = (
  formData: TransferFormData,
  fullName: string,
  t: (key: string) => string,
) => {
  return {
    [t('transfer.confirm.amount_label')]: formData.amount,
    [t('transfer.confirm.recipient_account_label')]: formData.recipientAccount,
    [t('transfer.confirm.recipient_name_label')]: fullName,
    [t('transfer.confirm.content_label')]: sanitizeTransferContent(
      formData.content,
    ), // Sanitize for display
  };
};

/*
 * Sanitize transfer content
 */
export const sanitizeTransferContent = (content: string): string => {
  return content
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Replace multiple whitespace (spaces, tabs, newlines) with single space
    .replace(/\n+/g, ' '); // Replace newlines with space
};
