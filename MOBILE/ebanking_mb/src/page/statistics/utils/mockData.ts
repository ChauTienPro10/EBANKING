// Mock transaction data for statistics demonstration
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

/**
 * Generate mock transactions for statistics screen
 * Includes transactions from the last 3 months with variety
 */
export const generateMockTransactions = (
  currentAccountNumber: string,
): TransferResponse[] => {
  const now = new Date();
  const transactions: TransferResponse[] = [];

  // Helper to create date in the past
  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  // Mock recipient accounts with names
  const recipients = [
    '1234567890123456', // Nguyễn Văn A
    '2345678901234567', // Trần Thị B
    '3456789012345678', // Lê Văn C
    '4567890123456789', // Phạm Thị D
    '5678901234567890', // Hoàng Văn E
    '6789012345678901', // Võ Thị F
    '7890123456789012', // Đặng Văn G
    '8901234567890123', // Bùi Thị H
  ];

  const descriptions = [
    'Chuyển tiền ăn trưa',
    'Thanh toán tiền điện',
    'Mua sắm cuối tuần',
    'Thanh toán tiền nhà',
    'Mua quà sinh nhật',
    'Ăn nhà hàng',
    'Thanh toán internet',
    'Đổ xăng',
    'Cafe với bạn',
    'Mua sách',
    'Đi chợ',
    'Mua quần áo',
    'Thanh toán bảo hiểm',
    'Mua đồ ăn',
    'Thanh toán thẻ tín dụng',
    'Đi du lịch',
    'Mua điện thoại',
    'Sửa xe',
    'Khám bệnh',
    'Mua thuốc',
    'Học phí',
    'Gym',
  ];

  // This week (last 7 days) - 15 transactions
  const thisWeekAmounts = [
    50000, 120000, 300000, 80000, 250000, 45000, 150000, 200000, 35000, 90000,
    180000, 60000, 400000, 75000, 110000,
  ];
  thisWeekAmounts.forEach((amount, i) => {
    const isIncoming = i % 4 === 0; // 25% incoming
    transactions.push({
      transactionId: 1000 + i,
      senderAccountNumber: isIncoming
        ? recipients[i % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[i % recipients.length],
      amount,
      description: descriptions[i % descriptions.length],
      transactionAt: daysAgo(i % 7),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Last week (8-14 days ago) - 12 transactions
  const lastWeekAmounts = [
    600000, 150000, 450000, 180000, 95000, 320000, 70000, 280000, 55000, 190000,
    420000, 85000,
  ];
  lastWeekAmounts.forEach((amount, i) => {
    const isIncoming = i % 5 === 0;
    transactions.push({
      transactionId: 2000 + i,
      senderAccountNumber: isIncoming
        ? recipients[(i + 2) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 2) % recipients.length],
      amount,
      description: descriptions[(i + 5) % descriptions.length],
      transactionAt: daysAgo(8 + (i % 7)),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // This month (15-30 days ago) - 18 transactions
  const thisMonthAmounts = [
    700000, 5000000, 320000, 55000, 110000, 2500000, 95000, 380000, 65000,
    220000, 1500000, 140000, 480000, 88000, 350000, 72000, 260000, 125000,
  ];
  thisMonthAmounts.forEach((amount, i) => {
    const isIncoming = i % 3 === 0; // 33% incoming
    transactions.push({
      transactionId: 3000 + i,
      senderAccountNumber: isIncoming
        ? recipients[(i + 3) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 3) % recipients.length],
      amount,
      description: descriptions[(i + 10) % descriptions.length],
      transactionAt: daysAgo(15 + i),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Last month (31-60 days ago) - 15 transactions
  const lastMonthAmounts = [
    900000, 2800000, 650000, 2200000, 1500000, 80000, 450000, 175000, 95000,
    1200000, 68000, 520000, 135000, 380000, 92000,
  ];
  lastMonthAmounts.forEach((amount, i) => {
    const isIncoming = i % 4 === 0;
    transactions.push({
      transactionId: 4000 + i,
      senderAccountNumber: isIncoming
        ? recipients[(i + 4) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 4) % recipients.length],
      amount,
      description: descriptions[(i + 15) % descriptions.length],
      transactionAt: daysAgo(31 + i),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // 2 months ago (61-90 days ago) - 12 transactions
  const twoMonthsAmounts = [
    1000000, 3500000, 750000, 2000000, 580000, 1800000, 95000, 420000, 165000,
    880000, 72000, 1100000,
  ];
  twoMonthsAmounts.forEach((amount, i) => {
    const isIncoming = i % 5 === 0;
    transactions.push({
      transactionId: 5000 + i,
      senderAccountNumber: isIncoming
        ? recipients[(i + 5) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 5) % recipients.length],
      amount,
      description: descriptions[(i + 18) % descriptions.length],
      transactionAt: daysAgo(61 + i * 2),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Last year (for year comparison) - 8 transactions
  const lastYear = new Date(now);
  lastYear.setFullYear(lastYear.getFullYear() - 1);
  const lastYearAmounts = [
    5000000, 10000000, 3200000, 1500000, 8500000, 2800000, 6200000, 4100000,
  ];
  lastYearAmounts.forEach((amount, i) => {
    const isIncoming = i % 3 === 0;
    const date = new Date(lastYear);
    date.setDate(date.getDate() + i * 10);
    transactions.push({
      transactionId: 6000 + i,
      senderAccountNumber: isIncoming
        ? recipients[i % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[i % recipients.length],
      amount,
      description: descriptions[i % descriptions.length],
      transactionAt: date.toISOString(),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  return transactions;
};

// Export mock data flag
export const USE_MOCK_DATA = true;
