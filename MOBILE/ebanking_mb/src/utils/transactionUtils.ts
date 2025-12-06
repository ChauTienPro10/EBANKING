import { TransferResponse } from '../store/fetchAPI/TransactionHistory';

/**
 * Kiểm tra xem giao dịch có phải là tiền vào không
 * @param transaction - Giao dịch cần kiểm tra
 * @param currentAccountNumber - Số tài khoản hiện tại
 * @returns true nếu là tiền vào, false nếu là tiền ra
 */
export const isIncomingTransaction = (
  transaction: TransferResponse,
  currentAccountNumber: string,
): boolean => {
  return transaction.receiverAccountNumber === currentAccountNumber;
};

/**
 * Lấy tên icon dựa trên loại giao dịch và hướng (vào/ra)
 * @param transaction - Giao dịch
 * @param currentAccountNumber - Số tài khoản hiện tại
 * @returns Tên icon
 */
export const getTransactionIcon = (
  transaction: TransferResponse,
  currentAccountNumber: string,
): string => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);

  switch (transaction.transactionType) {
    case 'TRANSFER':
      return isIncoming ? 'arrow-down-circle' : 'arrow-up-circle';
    case 'PAYMENT':
      return 'credit-card';
    case 'DEPOSIT':
      return 'wallet';
    case 'WITHDRAWAL':
      return 'cash';
    default:
      return 'swap-horizontal';
  }
};

/**
 * Lấy màu sắc dựa trên loại giao dịch và hướng (vào/ra)
 * @param transaction - Giao dịch
 * @param currentAccountNumber - Số tài khoản hiện tại
 * @returns Màu sắc
 */
export const getTransactionColor = (
  transaction: TransferResponse,
  currentAccountNumber: string,
): string => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);

  if (transaction.status === 'FAILED') {
    return '#FF3B30'; // Đỏ cho giao dịch thất bại
  }

  if (transaction.status === 'PENDING') {
    return '#FF9500'; // Cam cho giao dịch đang xử lý
  }

  return isIncoming ? '#34C759' : '#FF3B30'; // Xanh cho vào, đỏ cho ra
};

/**
 * Format số tiền với dấu +/- và định dạng
 * @param transaction - Giao dịch
 * @param currentAccountNumber - Số tài khoản hiện tại
 * @returns Chuỗi số tiền đã format
 */
export const formatTransactionAmount = (
  transaction: TransferResponse,
  currentAccountNumber: string,
): string => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);
  const sign = isIncoming ? '+' : '-';
  const formattedAmount = transaction.amount.toLocaleString('vi-VN');

  return `${sign}${formattedAmount} ${transaction.currency}`;
};

/**
 * Chuyển timestamp thành relative time (vd: "2 giờ trước")
 * @param timestamp - Timestamp ISO string
 * @returns Chuỗi relative time
 */
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const transactionDate = new Date(timestamp);
  const diffInMs = now.getTime() - transactionDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else {
    return transactionDate.toLocaleDateString('vi-VN');
  }
};

/**
 * Lấy màu cho status badge
 * @param status - Trạng thái giao dịch
 * @returns Object chứa màu background và text
 */
export const getStatusBadgeColor = (
  status: string,
): { bg: string; text: string } => {
  switch (status) {
    case 'SUCCESS':
      return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'PENDING':
      return { bg: '#FFF3E0', text: '#E65100' };
    case 'FAILED':
      return { bg: '#FFEBEE', text: '#C62828' };
    default:
      return { bg: '#F5F5F5', text: '#616161' };
  }
};

/**
 * Lấy text hiển thị cho status
 * @param status - Trạng thái giao dịch
 * @returns Text hiển thị
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'Thành công';
    case 'PENDING':
      return 'Đang xử lý';
    case 'FAILED':
      return 'Thất bại';
    default:
      return status;
  }
};

/**
 * Lấy tên người gửi/nhận để hiển thị
 * @param transaction - Giao dịch
 * @param currentAccountNumber - Số tài khoản hiện tại
 * @returns Tên và số tài khoản
 */
export const getTransactionParty = (
  transaction: TransferResponse,
  currentAccountNumber: string,
): { name: string; accountNumber: string } => {
  const isIncoming = isIncomingTransaction(transaction, currentAccountNumber);

  if (isIncoming) {
    return {
      name: 'Từ',
      accountNumber: transaction.senderAccountNumber,
    };
  } else {
    return {
      name: 'Đến',
      accountNumber: transaction.receiverAccountNumber,
    };
  }
};
