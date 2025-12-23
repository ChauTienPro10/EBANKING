import { Alert } from 'react-native';

export interface MobileOperator {
  id: string;
  name: string;
  code: string;
  logo: string;
  prefixes: string[];
}

export interface PrepaidPackage {
  id: string;
  operatorId: string;
  amount: number;
  bonus: number;
  description: string;
  validity: string;
  type: 'data' | 'call' | 'combo';
}

export interface PrepaidTransaction {
  id: string;
  phoneNumber: string;
  operatorId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
}

export interface PrepaidRequest {
  phoneNumber: string;
  operatorId: string;
  packageId: string;
  amount: number;
  pin: string;
}

class MobilePrepaidService {
  constructor() {
    // No dependencies needed for mock implementation
  }

  // Lấy danh sách nhà mạng
  async getMobileOperators(): Promise<MobileOperator[]> {
    try {
      // Mock data - trong thực tế sẽ gọi API
      return [
        {
          id: 'viettel',
          name: 'Viettel',
          code: 'VTT',
          logo: 'https://via.placeholder.com/50x50/ff0000/ffffff?text=VTT',
          prefixes: ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039']
        },
        {
          id: 'vinaphone',
          name: 'VinaPhone',
          code: 'VNP',
          logo: 'https://via.placeholder.com/50x50/0066cc/ffffff?text=VNP',
          prefixes: ['088', '091', '094', '083', '084', '085', '081', '082']
        },
        {
          id: 'mobifone',
          name: 'MobiFone',
          code: 'MBF',
          logo: 'https://via.placeholder.com/50x50/ff6600/ffffff?text=MBF',
          prefixes: ['089', '090', '093', '070', '079', '077', '076', '078']
        },
        {
          id: 'vietnamobile',
          name: 'Vietnamobile',
          code: 'VNM',
          logo: 'https://via.placeholder.com/50x50/00cc00/ffffff?text=VNM',
          prefixes: ['092', '056', '058']
        }
      ];
    } catch (error) {
      console.error('Error fetching mobile operators:', error);
      throw error;
    }
  }

  // Tự động nhận diện nhà mạng từ số điện thoại
  async detectOperator(phoneNumber: string): Promise<MobileOperator | null> {
    try {
      const operators = await this.getMobileOperators();
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length < 10) return null;
      
      const prefix = cleanPhone.substring(0, 3);
      
      return operators.find(op => 
        op.prefixes.includes(prefix)
      ) || null;
    } catch (error) {
      console.error('Error detecting operator:', error);
      return null;
    }
  }

  // Lấy danh sách gói nạp theo nhà mạng
  async getPrepaidPackages(operatorId: string): Promise<PrepaidPackage[]> {
    try {
      // Mock data - trong thực tế sẽ gọi API
      const packages: Record<string, PrepaidPackage[]> = {
        viettel: [
          { id: 'vtt_10k', operatorId: 'viettel', amount: 10000, bonus: 0, description: 'Nạp tiền 10.000đ', validity: '30 ngày', type: 'call' },
          { id: 'vtt_20k', operatorId: 'viettel', amount: 20000, bonus: 2000, description: 'Nạp tiền 20.000đ + 2.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vtt_50k', operatorId: 'viettel', amount: 50000, bonus: 7000, description: 'Nạp tiền 50.000đ + 7.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vtt_100k', operatorId: 'viettel', amount: 100000, bonus: 20000, description: 'Nạp tiền 100.000đ + 20.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vtt_data_3gb', operatorId: 'viettel', amount: 77000, bonus: 0, description: '3GB Data + Gọi nội mạng miễn phí', validity: '30 ngày', type: 'data' },
          { id: 'vtt_data_6gb', operatorId: 'viettel', amount: 135000, bonus: 0, description: '6GB Data + Gọi nội mạng miễn phí', validity: '30 ngày', type: 'data' }
        ],
        vinaphone: [
          { id: 'vnp_10k', operatorId: 'vinaphone', amount: 10000, bonus: 0, description: 'Nạp tiền 10.000đ', validity: '30 ngày', type: 'call' },
          { id: 'vnp_20k', operatorId: 'vinaphone', amount: 20000, bonus: 2000, description: 'Nạp tiền 20.000đ + 2.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vnp_50k', operatorId: 'vinaphone', amount: 50000, bonus: 7000, description: 'Nạp tiền 50.000đ + 7.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vnp_100k', operatorId: 'vinaphone', amount: 100000, bonus: 20000, description: 'Nạp tiền 100.000đ + 20.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vnp_data_4gb', operatorId: 'vinaphone', amount: 90000, bonus: 0, description: '4GB Data + 50 phút gọi', validity: '30 ngày', type: 'data' }
        ],
        mobifone: [
          { id: 'mbf_10k', operatorId: 'mobifone', amount: 10000, bonus: 0, description: 'Nạp tiền 10.000đ', validity: '30 ngày', type: 'call' },
          { id: 'mbf_20k', operatorId: 'mobifone', amount: 20000, bonus: 2000, description: 'Nạp tiền 20.000đ + 2.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'mbf_50k', operatorId: 'mobifone', amount: 50000, bonus: 7000, description: 'Nạp tiền 50.000đ + 7.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'mbf_100k', operatorId: 'mobifone', amount: 100000, bonus: 20000, description: 'Nạp tiền 100.000đ + 20.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'mbf_data_5gb', operatorId: 'mobifone', amount: 120000, bonus: 0, description: '5GB Data + Gọi nội mạng miễn phí', validity: '30 ngày', type: 'data' }
        ],
        vietnamobile: [
          { id: 'vnm_10k', operatorId: 'vietnamobile', amount: 10000, bonus: 0, description: 'Nạp tiền 10.000đ', validity: '30 ngày', type: 'call' },
          { id: 'vnm_20k', operatorId: 'vietnamobile', amount: 20000, bonus: 3000, description: 'Nạp tiền 20.000đ + 3.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vnm_50k', operatorId: 'vietnamobile', amount: 50000, bonus: 10000, description: 'Nạp tiền 50.000đ + 10.000đ KM', validity: '30 ngày', type: 'call' },
          { id: 'vnm_data_2gb', operatorId: 'vietnamobile', amount: 60000, bonus: 0, description: '2GB Data + 100 phút gọi', validity: '30 ngày', type: 'data' }
        ]
      };

      return packages[operatorId] || [];
    } catch (error) {
      console.error('Error fetching prepaid packages:', error);
      throw error;
    }
  }

  // Thực hiện nạp tiền
  async topUpMobile(request: PrepaidRequest): Promise<PrepaidTransaction> {
    try {
      // Validate input
      if (!request.phoneNumber || !request.operatorId || !request.packageId || !request.pin) {
        throw new Error('Missing required fields');
      }

      // Mock API call - trong thực tế sẽ gọi API backend
      const response = await new Promise<PrepaidTransaction>((resolve, reject) => {
        setTimeout(() => {
          // Simulate success/failure
          const isSuccess = Math.random() > 0.1; // 90% success rate
          
          if (isSuccess) {
            resolve({
              id: `txn_${Date.now()}`,
              phoneNumber: request.phoneNumber,
              operatorId: request.operatorId,
              packageId: request.packageId,
              amount: request.amount,
              status: 'success',
              transactionId: `TXN${Date.now()}`,
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            });
          } else {
            reject(new Error('Transaction failed'));
          }
        }, 2000);
      });

      return response;
    } catch (error) {
      console.error('Error processing mobile top-up:', error);
      throw error;
    }
  }

  // Lấy lịch sử nạp tiền
  async getTopUpHistory(): Promise<PrepaidTransaction[]> {
    try {
      // Mock data - trong thực tế sẽ gọi API
      return [
        {
          id: 'txn_1',
          phoneNumber: '0987654321',
          operatorId: 'viettel',
          packageId: 'vtt_50k',
          amount: 50000,
          status: 'success',
          transactionId: 'TXN123456789',
          createdAt: '2024-12-23T10:30:00Z',
          completedAt: '2024-12-23T10:30:15Z'
        },
        {
          id: 'txn_2',
          phoneNumber: '0912345678',
          operatorId: 'vinaphone',
          packageId: 'vnp_100k',
          amount: 100000,
          status: 'success',
          transactionId: 'TXN123456788',
          createdAt: '2024-12-22T15:45:00Z',
          completedAt: '2024-12-22T15:45:12Z'
        }
      ];
    } catch (error) {
      console.error('Error fetching top-up history:', error);
      throw error;
    }
  }
}

export default new MobilePrepaidService();