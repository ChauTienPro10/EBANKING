import { TransferResponse } from '../../store/fetchAPI/TransactionHistory';

/**
 * Mock Transaction Data
 *
 * Số tài khoản được thiết kế theo format của các ngân hàng Việt Nam:
 * - 1234567890: Tài khoản của user (nội bộ)
 * - 0011xxxxxx: Vietcombank (VCB)
 * - 0021xxxxxx: VietinBank (CTG)
 * - 0031xxxxxx: BIDV (BID)
 * - 0041xxxxxx: MB Bank (MBB)
 * - 0051xxxxxx: Techcombank (TCB)
 * - 0061xxxxxx: ACB
 * - 0071xxxxxx: VPBank (VPB)
 * - 0081xxxxxx: Sacombank (STB)
 * - 9999999xxx: Công ty/Tổ chức
 */
export const MOCK_TRANSACTIONS: TransferResponse[] = [
  // ========== Tháng 12/2025 ==========

  // Chuyển tiền nội bộ
  {
    transactionId: 1,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '1234567891', // Nội bộ
    amount: 500000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Chuyển tiền mua sắm',
    status: 'SUCCESS',
    transactionAt: '2025-12-07T10:30:00Z',
    balance: 15000000,
  },

  // Nhận tiền từ Vietcombank
  {
    transactionId: 2,
    senderAccountNumber: '0011234567', // Vietcombank
    receiverAccountNumber: '1234567890',
    amount: 1200000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Hoàn tiền đơn hàng Shopee',
    status: 'SUCCESS',
    transactionAt: '2025-12-06T14:20:00Z',
    balance: 15500000,
  },

  // Thanh toán hóa đơn điện
  {
    transactionId: 3,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999001', // Công ty Điện lực
    amount: 300000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Thanh toán tiền điện tháng 12',
    status: 'SUCCESS',
    transactionAt: '2025-12-05T09:15:00Z',
    balance: 14300000,
  },

  // Chuyển tiền sang Techcombank (đang chờ)
  {
    transactionId: 4,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '0051234567', // Techcombank
    amount: 2500000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Chuyển tiền cho gia đình',
    status: 'PENDING',
    transactionAt: '2025-12-04T16:45:00Z',
    balance: 14600000,
  },

  // Nhận lương
  {
    transactionId: 5,
    senderAccountNumber: '9999999100', // Công ty ABC
    receiverAccountNumber: '1234567890',
    amount: 5000000,
    currency: 'VND',
    transactionType: 'SALARY',
    description: 'Lương tháng 12/2025',
    status: 'SUCCESS',
    transactionAt: '2025-12-01T08:00:00Z',
    balance: 17100000,
  },

  // ========== Tháng 11/2025 ==========

  // Mua hàng online
  {
    transactionId: 6,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999200', // Shop Lazada
    amount: 800000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Mua hàng Lazada - Đơn #LZ123456',
    status: 'SUCCESS',
    transactionAt: '2025-11-28T11:30:00Z',
    balance: 12100000,
  },

  // Hoàn tiền bảo hiểm từ MB Bank
  {
    transactionId: 7,
    senderAccountNumber: '0041234567', // MB Bank
    receiverAccountNumber: '1234567890',
    amount: 1500000,
    currency: 'VND',
    transactionType: 'REFUND',
    description: 'Hoàn tiền bảo hiểm sức khỏe',
    status: 'SUCCESS',
    transactionAt: '2025-11-25T13:20:00Z',
    balance: 12900000,
  },

  // Thanh toán tiền nước
  {
    transactionId: 8,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999002', // Công ty Cấp nước
    amount: 450000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Thanh toán tiền nước tháng 11',
    status: 'SUCCESS',
    transactionAt: '2025-11-20T10:00:00Z',
    balance: 11400000,
  },

  // Nhận tiền từ bạn bè qua VietinBank
  {
    transactionId: 9,
    senderAccountNumber: '0021234567', // VietinBank
    receiverAccountNumber: '1234567890',
    amount: 3000000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Trả tiền ăn nhậu cuối tuần',
    status: 'SUCCESS',
    transactionAt: '2025-11-15T15:30:00Z',
    balance: 11850000,
  },

  // Nhận lương
  {
    transactionId: 10,
    senderAccountNumber: '9999999100', // Công ty ABC
    receiverAccountNumber: '1234567890',
    amount: 5000000,
    currency: 'VND',
    transactionType: 'SALARY',
    description: 'Lương tháng 11/2025',
    status: 'SUCCESS',
    transactionAt: '2025-11-01T08:00:00Z',
    balance: 8850000,
  },

  // ========== Tháng 10/2025 ==========

  // Thanh toán học phí sang BIDV
  {
    transactionId: 11,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '0031234567', // BIDV
    amount: 2000000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Thanh toán học phí kỳ 1 năm 2025',
    status: 'SUCCESS',
    transactionAt: '2025-10-25T09:00:00Z',
    balance: 3850000,
  },

  // Hoàn tiền từ ACB
  {
    transactionId: 12,
    senderAccountNumber: '0061234567', // ACB
    receiverAccountNumber: '1234567890',
    amount: 750000,
    currency: 'VND',
    transactionType: 'REFUND',
    description: 'Hoàn tiền hủy đơn hàng Tiki',
    status: 'SUCCESS',
    transactionAt: '2025-10-20T14:15:00Z',
    balance: 5850000,
  },

  // Thanh toán tiền điện
  {
    transactionId: 13,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999001', // Công ty Điện lực
    amount: 350000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Thanh toán tiền điện tháng 10',
    status: 'SUCCESS',
    transactionAt: '2025-10-15T10:30:00Z',
    balance: 5100000,
  },

  // Chuyển tiền sang VPBank
  {
    transactionId: 14,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '0071234567', // VPBank
    amount: 1800000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Chuyển tiền cho mẹ',
    status: 'SUCCESS',
    transactionAt: '2025-10-10T16:00:00Z',
    balance: 5450000,
  },

  // Nhận lương
  {
    transactionId: 15,
    senderAccountNumber: '9999999100', // Công ty ABC
    receiverAccountNumber: '1234567890',
    amount: 5000000,
    currency: 'VND',
    transactionType: 'SALARY',
    description: 'Lương tháng 10/2025',
    status: 'SUCCESS',
    transactionAt: '2025-10-01T08:00:00Z',
    balance: 7250000,
  },

  // ========== Giao dịch bổ sung ==========

  // Chuyển tiền sang Sacombank
  {
    transactionId: 16,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '0081234567', // Sacombank
    amount: 600000,
    currency: 'VND',
    transactionType: 'TRANSFER',
    description: 'Trả tiền cafe',
    status: 'SUCCESS',
    transactionAt: '2025-12-03T14:30:00Z',
    balance: 14000000,
  },

  // Thanh toán internet
  {
    transactionId: 17,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999003', // FPT Telecom
    amount: 200000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Thanh toán cước internet tháng 12',
    status: 'SUCCESS',
    transactionAt: '2025-12-02T11:00:00Z',
    balance: 13400000,
  },

  // Nạp tiền điện thoại
  {
    transactionId: 18,
    senderAccountNumber: '1234567890',
    receiverAccountNumber: '9999999004', // Viettel
    amount: 100000,
    currency: 'VND',
    transactionType: 'PAYMENT',
    description: 'Nạp tiền điện thoại 0987654321',
    status: 'SUCCESS',
    transactionAt: '2025-11-30T09:20:00Z',
    balance: 13200000,
  },
];
