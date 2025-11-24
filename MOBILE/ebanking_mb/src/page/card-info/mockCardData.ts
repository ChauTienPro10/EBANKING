// Mock data for Card Screen
// Designed for easy mapping with Backend API

export interface CardData {
  cardId: string;
  cardNumber: string; // Last 4 digits visible
  cardType: 'Credit Card' | 'Debit Card';
  balance: number;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  cardLimit: number;
  spentAmount: number;
  currency: string;
}

export interface Transaction {
  transactionId: string;
  merchantName: string;
  merchantIcon: 'cart' | 'phone' | 'user' | 'transfer' | 'cash';
  date: string; // Format: DD MMM
  time: string; // Format: HH:mm
  amount: number;
  type: 'sent' | 'received';
  category: string;
}

// Mock Card Data
export const mockCardData: CardData = {
  cardId: 'CARD_001',
  cardNumber: '5460', // Last 4 digits
  cardType: 'Credit Card',
  balance: 35000000, // 35 triệu VNĐ
  expiryMonth: '12',
  expiryYear: '25',
  cardHolderName: 'Nguyễn Văn A',
  cardLimit: 70000000, // 70 triệu VNĐ
  spentAmount: 35000000, // 35 triệu VNĐ
  currency: 'VNĐ',
};

// Mock Transaction Data
export const mockTransactions: Transaction[] = [
  {
    transactionId: 'TXN_001',
    merchantName: 'Big C Supermarket',
    merchantIcon: 'cart',
    date: '20 Nov',
    time: '17:34',
    amount: 3000000,
    type: 'sent',
    category: 'Shopping',
  },
  {
    transactionId: 'TXN_002',
    merchantName: 'Shopee Vietnam',
    merchantIcon: 'cart',
    date: '20 Nov',
    time: '15:22',
    amount: 2000000,
    type: 'sent',
    category: 'Shopping',
  },
  {
    transactionId: 'TXN_003',
    merchantName: 'Lương tháng 11',
    merchantIcon: 'cash',
    date: '20 Nov',
    time: '09:15',
    amount: 15000000,
    type: 'received',
    category: 'Salary',
  },
  {
    transactionId: 'TXN_004',
    merchantName: 'Viettel Telecom',
    merchantIcon: 'phone',
    date: '19 Nov',
    time: '14:10',
    amount: 200000,
    type: 'sent',
    category: 'Mobile',
  },
  {
    transactionId: 'TXN_005',
    merchantName: 'Trần Thị B',
    merchantIcon: 'user',
    date: '19 Nov',
    time: '11:45',
    amount: 5000000,
    type: 'received',
    category: 'Transfer',
  },
  {
    transactionId: 'TXN_006',
    merchantName: 'Grab Vietnam',
    merchantIcon: 'transfer',
    date: '18 Nov',
    time: '20:30',
    amount: 150000,
    type: 'sent',
    category: 'Transport',
  },
  {
    transactionId: 'TXN_007',
    merchantName: 'Highlands Coffee',
    merchantIcon: 'cart',
    date: '18 Nov',
    time: '16:20',
    amount: 180000,
    type: 'sent',
    category: 'Food & Drink',
  },
  {
    transactionId: 'TXN_008',
    merchantName: 'Lê Văn C',
    merchantIcon: 'user',
    date: '17 Nov',
    time: '13:00',
    amount: 2500000,
    type: 'received',
    category: 'Transfer',
  },
  {
    transactionId: 'TXN_009',
    merchantName: 'Lazada Vietnam',
    merchantIcon: 'cart',
    date: '17 Nov',
    time: '10:15',
    amount: 1200000,
    type: 'sent',
    category: 'Shopping',
  },
  {
    transactionId: 'TXN_010',
    merchantName: 'VNPay QR Payment',
    merchantIcon: 'transfer',
    date: '16 Nov',
    time: '19:45',
    amount: 450000,
    type: 'sent',
    category: 'Payment',
  },
  {
    transactionId: 'TXN_011',
    merchantName: 'Hoàn tiền Shopee',
    merchantIcon: 'cash',
    date: '16 Nov',
    time: '14:30',
    amount: 500000,
    type: 'received',
    category: 'Refund',
  },
  {
    transactionId: 'TXN_012',
    merchantName: 'Circle K',
    merchantIcon: 'cart',
    date: '15 Nov',
    time: '08:20',
    amount: 85000,
    type: 'sent',
    category: 'Shopping',
  },
];

// Helper function to filter transactions
export const filterTransactions = (
  transactions: Transaction[],
  filter: 'all' | 'sent' | 'received',
): Transaction[] => {
  if (filter === 'all') return transactions;
  return transactions.filter(t => t.type === filter);
};

// Helper function to format currency
export const formatCurrency = (
  amount: number,
  currency: string = 'VNĐ',
): string => {
  return `${amount.toLocaleString('vi-VN')} ${currency}`;
};
