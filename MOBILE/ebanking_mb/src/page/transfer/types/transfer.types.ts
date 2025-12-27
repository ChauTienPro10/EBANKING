import React from 'react';

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo?: React.ComponentType<{ size?: number; color?: string }>;
}

export interface TransferParams {
  receiver: string;
  amount: string;
  content: string;
  bankCode: string;
}

export interface TransferPurpose {
  id: string;
  name: string;
  code: string;
  icon?: string;
}

export interface TransferFormData {
  recipientAccount: string;
  amount: string;
  content: string;
  transferType: 'internal' | 'external';
  selectedBank?: Bank;
  purpose?: TransferPurpose;
  category?: import('../../../types/SpendingCategory.types').SpendingCategory;
}

export interface FormErrors {
  recipientAccount?: string;
  amount?: string;
  content?: string;
}

export interface SavedAccount {
  accountNumber: string;
  accountName: string;
  savedAt: number;
}
