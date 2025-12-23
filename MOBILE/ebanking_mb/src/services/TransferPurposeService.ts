import { API } from '../constants/api';
import { TransferPurpose } from '../page/transfer/types/transfer.types';
import fetch from '../utils/fetch';

// Fallback data khi API chưa sẵn sàng
const FALLBACK_PURPOSES: TransferPurpose[] = [
  {
    id: '1',
    name: 'Đi chợ',
    code: 'MARKET',
    icon: '🛒',
  },
  {
    id: '2',
    name: 'Mua sắm',
    code: 'SHOPPING',
    icon: '🛍️',
  },
  {
    id: '3',
    name: 'Hóa đơn',
    code: 'BILL',
    icon: '📄',
  },
  {
    id: '4',
    name: 'Học phí',
    code: 'TUITION',
    icon: '🎓',
  },
  {
    id: '5',
    name: 'Ăn uống',
    code: 'FOOD',
    icon: '🍽️',
  },
  {
    id: '6',
    name: 'Khác',
    code: 'OTHER',
    icon: '📝',
  },
];

export class TransferPurposeService {
  static async getTransferPurposes(): Promise<TransferPurpose[]> {
    try {
      // Sử dụng custom fetch utility với authRequire = false
      const data = await fetch.get(API.GET_TRANSFER_PURPOSES, {}, true);
      return data.purposes || FALLBACK_PURPOSES;
    } catch (error) {
      // Nếu có lỗi (403, 404, 500, network...), sử dụng fallback data
      console.warn('Error fetching transfer purposes, using fallback data:', error);
      return FALLBACK_PURPOSES;
    }
  }
}