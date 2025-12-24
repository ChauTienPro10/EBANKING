import { TransferFormData, TransferPurpose } from '../types/transfer.types';

export const STORAGE_KEY = 'saved_recipient_accounts';

export const formatAmount = (text: string): string => {
  if (!text) return '';
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
    ...(formData.purpose && {
      [t('transfer.confirm.purpose_label')]: formData.purpose.name,
    }),
  };
};

/*
 * Build transfer content with purpose prefix
 */
export const buildTransferContent = (
  content: string,
  purpose?: TransferPurpose,
): string => {
  const sanitizedContent = sanitizeTransferContent(content);

  if (purpose && purpose.code) {
    return `[${purpose.code}] ${sanitizedContent}`;
  }

  return sanitizedContent;
};

/*
 * Extract purpose code from transfer content
 */
export const extractPurposeFromContent = (
  content: string,
): {
  purposeCode?: string;
  cleanContent: string;
} => {
  const match = content.match(/^\[([^\]]+)\]\s*(.*)$/);

  if (match) {
    return {
      purposeCode: match[1],
      cleanContent: match[2] || '',
    };
  }

  return {
    cleanContent: content,
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
