import { useState, useMemo, useEffect } from 'react';
import { Clipboard, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';
import { isIncomingTransaction } from '../../../utils/transactionUtils';
import fetch from '../../../utils/fetch';
import { API } from '../../../constants/api';

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

  // State for account holder names
  const [senderName, setSenderName] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [loadingNames, setLoadingNames] = useState(true);

  // Fetch account holder names
  useEffect(() => {
    const fetchAccountNames = async () => {
      if (transaction.transactionType !== 'TRANSFER') {
        setLoadingNames(false);
        return;
      }

      try {
        // Fetch sender name
        const senderResponse = await fetch.post(API.CHECK_ACCOUNT_NUMBER, {
          accountNumber: transaction.senderAccountNumber,
        });
        if (senderResponse?.isExist) {
          setSenderName(senderResponse.fullName);
        }

        // Fetch receiver name
        const receiverResponse = await fetch.post(API.CHECK_ACCOUNT_NUMBER, {
          accountNumber: transaction.receiverAccountNumber,
        });
        if (receiverResponse?.isExist) {
          setReceiverName(receiverResponse.fullName);
        }
      } catch (error) {
        console.error('Error fetching account names:', error);
      } finally {
        setLoadingNames(false);
      }
    };

    fetchAccountNames();
  }, [
    transaction.senderAccountNumber,
    transaction.receiverAccountNumber,
    transaction.transactionType,
  ]);

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
    if (transaction.transactionType === 'TRANSFER') {
      if (isIncoming) {
        // For incoming transfers, pre-fill sender info (so user can send back)
        navigation.navigate('Transfer', {
          receiver: transaction.senderAccountNumber,
          amount: '',
          content: '',
          bankCode: bankName || '',
        });
      } else {
        // For outgoing transfers, pre-fill receiver info
        navigation.navigate('Transfer', {
          receiver: transaction.receiverAccountNumber,
          amount: '',
          content: '',
          bankCode: bankName || '',
        });
      }
    } else {
      // For other transaction types, just navigate to transfer screen
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
    senderName,
    receiverName,
    loadingNames,
    handleCopyTransactionId,
    handleSupport,
    handleNewTransaction,
    handleTransferMore,
  };
};
