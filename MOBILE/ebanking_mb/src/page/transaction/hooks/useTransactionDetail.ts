import { useState, useMemo } from 'react';
import { Clipboard, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import { isIncomingTransaction } from '../../../utils/transactionUtils';

interface UseTransactionDetailProps {
  transaction: TransferResponse;
  currentAccountNumber: string;
  navigation: any;
}

export const useTransactionDetail = ({
  transaction,
  currentAccountNumber,
  navigation,
}: UseTransactionDetailProps) => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);
  const date = new Date(transaction.transactionAt);

  // Format time and date
  const timeStr = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Icon configuration
  const iconConfig = useMemo(
    () => ({
      name: isIncoming ? 'arrow-down-circle' : 'arrow-up-circle',
      bg: isIncoming ? '#E8F5E9' : '#FFEBEE',
      color: isIncoming ? '#4CAF50' : '#F44336',
    }),
    [isIncoming],
  );

  // Status badge configuration
  const statusBadge = useMemo(() => {
    switch (transaction.status) {
      case 'SUCCESS':
        return { text: 'Thành công', bg: '#C8E6C9', color: '#2E7D32' };
      case 'PENDING':
        return { text: 'Đang xử lý', bg: '#FFF9C4', color: '#F57F17' };
      case 'FAILED':
        return { text: 'Thất bại', bg: '#FFCDD2', color: '#C62828' };
      default:
        return { text: transaction.status, bg: '#E0E0E0', color: '#616161' };
    }
  }, [transaction.status]);

  // Extract merchant/service name from description
  const displayTitle = useMemo(() => {
    if (transaction.transactionType === 'PAYMENT') {
      const match = transaction.description.match(/Thanh toán (.+)/i);
      return match ? match[1] : transaction.description;
    } else if (transaction.transactionType === 'TRANSFER') {
      const match = transaction.description.match(
        /Chuyển đến (.+?)(?:\s*\(|$)/i,
      );
      if (match) return match[1];

      const receiveMatch = transaction.description.match(/Nhận tiền từ (.+)/i);
      return receiveMatch ? receiveMatch[1] : transaction.description;
    }
    return transaction.description;
  }, [transaction.description, transaction.transactionType]);

  // Extract bank name if available in description
  const bankName = useMemo(() => {
    const match = transaction.description.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  }, [transaction.description]);

  // Handle copy transaction ID
  const handleCopyTransactionId = () => {
    Clipboard.setString(transaction.transactionId.toString());
    Toast.show({
      type: 'success',
      text1: 'Đã sao chép',
      text2: 'Mã giao dịch đã được sao chép',
      visibilityTime: 1500,
      autoHide: true,
      topOffset: 60,
    });
  };

  // Handle support button - call hotline
  const handleSupport = () => {
    const phoneNumber = '0812788212';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Handle new transaction - navigate to Transfer screen with pre-filled data
  const handleNewTransaction = () => {
    if (transaction.transactionType === 'TRANSFER' && !isIncoming) {
      // For outgoing transfers, pre-fill receiver info
      navigation.navigate('Transfer', {
        receiver: transaction.receiverAccountNumber,
        amount: '',
        content: '',
        bankCode: bankName || '',
      });
    } else {
      // For other cases, just navigate to transfer screen
      navigation.navigate('Transfer', {
        receiver: '',
        amount: '',
        content: '',
        bankCode: '',
      });
    }
  };

  // Handle transfer more - same as new transaction but with same receiver
  const handleTransferMore = () => {
    navigation.navigate('Transfer', {
      receiver: transaction.receiverAccountNumber,
      amount: '',
      content: transaction.description,
      bankCode: bankName || '',
    });
  };

  return {
    isIncoming,
    timeStr,
    dateStr,
    iconConfig,
    statusBadge,
    displayTitle,
    bankName,
    handleCopyTransactionId,
    handleSupport,
    handleNewTransaction,
    handleTransferMore,
  };
};
