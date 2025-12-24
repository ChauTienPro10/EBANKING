// Mock transaction data for statistics demonstration
// NOTE: Only generates historical data for months BEFORE December 2025
// December 2025 data comes from real API
import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

/**
 * Generate mock transactions for previous months and year
 * IMPORTANT: Does NOT include December 2025 - that's real data from API
 * Generates data for: Nov 2025, Oct 2025, Sep 2025, and all of 2024
 */
export const generateMockTransactions = (
  currentAccountNumber: string,
): TransferResponse[] => {
  const now = new Date('2025-12-24'); // Current date reference
  const transactions: TransferResponse[] = [];

  // Helper to create specific date
  const createDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day).toISOString();
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

  let transactionId = 10000;

  // ============================================
  // THÁNG 11/2025 - November 2025 (20 transactions)
  // ============================================
  const nov2025Amounts = [
    850000, 2500000, 450000, 180000, 95000, 1200000, 320000, 75000, 3500000,
    190000, 680000, 125000, 2100000, 88000, 450000, 165000, 920000, 72000,
    1800000, 250000,
  ];
  nov2025Amounts.forEach((amount, i) => {
    const isIncoming = i % 4 === 0;
    const day = Math.floor((i * 30) / nov2025Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[i % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[i % recipients.length],
      amount,
      description: descriptions[i % descriptions.length],
      transactionAt: createDate(2025, 11, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // ============================================
  // THÁNG 10/2025 - October 2025 (22 transactions)
  // ============================================
  const oct2025Amounts = [
    1200000, 3200000, 580000, 2200000, 1500000, 95000, 650000, 185000, 4100000,
    220000, 780000, 145000, 2800000, 98000, 520000, 195000, 1100000, 82000,
    2400000, 310000, 1650000, 425000,
  ];
  oct2025Amounts.forEach((amount, i) => {
    const isIncoming = i % 5 === 0;
    const day = Math.floor((i * 31) / oct2025Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 1) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 1) % recipients.length],
      amount,
      description: descriptions[(i + 3) % descriptions.length],
      transactionAt: createDate(2025, 10, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // ============================================
  // THÁNG 9/2025 - September 2025 (18 transactions)
  // ============================================
  const sep2025Amounts = [
    950000, 2800000, 620000, 1900000, 1300000, 88000, 580000, 175000, 3600000,
    205000, 720000, 135000, 2500000, 92000, 480000, 185000, 1050000, 78000,
  ];
  sep2025Amounts.forEach((amount, i) => {
    const isIncoming = i % 4 === 0;
    const day = Math.floor((i * 30) / sep2025Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 2) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 2) % recipients.length],
      amount,
      description: descriptions[(i + 6) % descriptions.length],
      transactionAt: createDate(2025, 9, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // ============================================
  // THÁNG 8/2025 - August 2025 (20 transactions)
  // ============================================
  const aug2025Amounts = [
    1100000, 3000000, 680000, 2100000, 1400000, 92000, 620000, 195000, 3800000,
    225000, 760000, 148000, 2700000, 95000, 510000, 198000, 1150000, 85000,
    2200000, 340000,
  ];
  aug2025Amounts.forEach((amount, i) => {
    const isIncoming = i % 5 === 0;
    const day = Math.floor((i * 31) / aug2025Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 3) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 3) % recipients.length],
      amount,
      description: descriptions[(i + 9) % descriptions.length],
      transactionAt: createDate(2025, 8, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // ============================================
  // NĂM 2024 - Year 2024 (Monthly summary - 60 transactions total)
  // ============================================
  // Tháng 12/2024 - December 2024
  const dec2024Amounts = [
    5500000, 1200000, 3800000, 950000, 2200000, 680000, 4100000, 1500000,
    820000, 2800000, 1100000, 3200000, 750000, 1900000, 580000,
  ];
  dec2024Amounts.forEach((amount, i) => {
    const isIncoming = i % 3 === 0;
    const day = Math.floor((i * 31) / dec2024Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[i % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[i % recipients.length],
      amount,
      description: descriptions[i % descriptions.length],
      transactionAt: createDate(2024, 12, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Tháng 11/2024 - November 2024
  const nov2024Amounts = [
    4800000, 1100000, 3500000, 880000, 2000000, 620000, 3800000, 1400000,
    780000, 2600000, 1050000, 3000000, 720000, 1800000, 550000,
  ];
  nov2024Amounts.forEach((amount, i) => {
    const isIncoming = i % 4 === 0;
    const day = Math.floor((i * 30) / nov2024Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 1) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 1) % recipients.length],
      amount,
      description: descriptions[(i + 2) % descriptions.length],
      transactionAt: createDate(2024, 11, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Tháng 10/2024 - October 2024
  const oct2024Amounts = [
    5200000, 1250000, 3700000, 920000, 2100000, 650000, 4000000, 1450000,
    800000, 2700000, 1080000, 3100000, 740000, 1850000, 570000,
  ];
  oct2024Amounts.forEach((amount, i) => {
    const isIncoming = i % 5 === 0;
    const day = Math.floor((i * 31) / oct2024Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 2) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 2) % recipients.length],
      amount,
      description: descriptions[(i + 4) % descriptions.length],
      transactionAt: createDate(2024, 10, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  // Tháng 9/2024 - September 2024
  const sep2024Amounts = [
    4500000, 1050000, 3300000, 850000, 1950000, 600000, 3700000, 1350000,
    750000, 2500000, 1000000, 2900000, 700000, 1750000, 540000,
  ];
  sep2024Amounts.forEach((amount, i) => {
    const isIncoming = i % 3 === 0;
    const day = Math.floor((i * 30) / sep2024Amounts.length) + 1;
    transactions.push({
      transactionId: transactionId++,
      senderAccountNumber: isIncoming
        ? recipients[(i + 3) % recipients.length]
        : currentAccountNumber,
      receiverAccountNumber: isIncoming
        ? currentAccountNumber
        : recipients[(i + 3) % recipients.length],
      amount,
      description: descriptions[(i + 6) % descriptions.length],
      transactionAt: createDate(2024, 9, day),
      status: 'SUCCESS',
      currency: 'VND',
      transactionType: isIncoming ? 'RECEIVE' : 'SEND',
    });
  });

  return transactions;
};

// Export mock data flag - Set to TRUE to see historical data
export const USE_MOCK_DATA = true;
