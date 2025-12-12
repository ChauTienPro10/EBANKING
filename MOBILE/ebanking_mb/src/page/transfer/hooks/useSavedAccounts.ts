import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedAccount } from '../types/transfer.types';
import { STORAGE_KEY } from '../utils/transfer.utils';

export const useSavedAccounts = () => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

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

  useEffect(() => {
    loadSavedAccounts();
  }, []);

  return {
    savedAccounts,
    loadSavedAccounts,
    saveRecipientAccountToStorage,
    deleteSavedAccount,
  };
};
