import fetch from '../utils/fetch';
import { API } from '../constants/api';

export interface DataPackage {
  packageId: number;
  providerId: number;
  providerCode: string;
  providerName: string;
  packageCode: string;
  packageName: string;
  dataAmount: number;
  formattedDataAmount: string;
  validityDays: number;
  price: number;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DataTopUpRequest {
  userId: number;
  username: string;
  phoneNumber: string;
  packageId: number;
  accountNumber: string;
  pin: string;
  requiresFaceAuth?: boolean;
  faceAuthSessionId?: string;
}

export interface DataTopUpTransaction {
  dataTopUpId: number;
  transactionId: string;
  phoneNumber: string;
  telecomProvider: string;
  packageName: string;
  formattedDataAmount: string;
  validityDays: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  providerTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
  requiresFaceAuth: boolean;
  faceAuthSessionId?: string;
  faceAuthVerified: boolean;
}

export interface DataTopUpHistoryResponse {
  content: DataTopUpTransaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface FaceAuthVerifyRequest {
  transactionId: string;
  faceAuthSessionId: string;
}

class Data4GService {
  // Lấy tất cả gói data
  async getAllDataPackages(): Promise<DataPackage[]> {
    try {
      const response = await fetch.get(API.GET_DATA_PACKAGES, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data packages:', error);
      throw error;
    }
  }

  // Lấy gói data theo nhà mạng (provider ID)
  async getDataPackagesByProvider(providerId: number): Promise<DataPackage[]> {
    try {
      const url = API.GET_DATA_PACKAGES_BY_PROVIDER.replace('{providerId}', providerId.toString());
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data packages by provider:', error);
      throw error;
    }
  }

  // Lấy gói data theo mã nhà mạng
  async getDataPackagesByProviderCode(providerCode: string): Promise<DataPackage[]> {
    try {
      const url = API.GET_DATA_PACKAGES_BY_PROVIDER_CODE.replace('{providerCode}', providerCode);
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data packages by provider code:', error);
      throw error;
    }
  }

  // Lấy thông tin gói data theo ID
  async getDataPackageById(packageId: number): Promise<DataPackage> {
    try {
      const url = API.GET_DATA_PACKAGE_BY_ID.replace('{packageId}', packageId.toString());
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data package by ID:', error);
      throw error;
    }
  }

  // Lấy thông tin gói data theo mã gói
  async getDataPackageByCode(packageCode: string): Promise<DataPackage> {
    try {
      const url = API.GET_DATA_PACKAGE_BY_CODE.replace('{packageCode}', packageCode);
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data package by code:', error);
      throw error;
    }
  }

  // Lấy gói data theo khoảng giá
  async getDataPackagesByPriceRange(
    providerId: number, 
    minPrice: number, 
    maxPrice: number
  ): Promise<DataPackage[]> {
    try {
      const url = API.GET_DATA_PACKAGES_BY_PRICE_RANGE.replace('{providerId}', providerId.toString());
      const response = await fetch.get(`${url}?minPrice=${minPrice}&maxPrice=${maxPrice}`, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data packages by price range:', error);
      throw error;
    }
  }

  // Khởi tạo nạp data 4G
  async initiateDataTopUp(request: DataTopUpRequest): Promise<DataTopUpTransaction> {
    try {
      // Validate input
      if (!request.phoneNumber || !request.packageId || !request.pin) {
        throw new Error('Missing required fields');
      }

      const response = await fetch.post(API.INITIATE_DATA_TOPUP, request, true);
      return response;
    } catch (error) {
      console.error('Error initiating data top-up:', error);
      throw error;
    }
  }

  // Xác thực khuôn mặt và xử lý
  async verifyFaceAuthAndProcess(request: FaceAuthVerifyRequest): Promise<DataTopUpTransaction> {
    try {
      const response = await fetch.post(API.VERIFY_DATA_FACE_AUTH, request, true);
      return response;
    } catch (error) {
      console.error('Error verifying face auth for data top-up:', error);
      throw error;
    }
  }

  // Lấy thông tin giao dịch
  async getTransactionDetail(transactionId: string): Promise<DataTopUpTransaction> {
    try {
      const url = API.GET_DATA_TRANSACTION.replace('{transactionId}', transactionId);
      const response = await fetch.get(url, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data transaction detail:', error);
      throw error;
    }
  }

  // Lấy lịch sử nạp data (simple)
  async getDataTopUpHistory(userId: number): Promise<DataTopUpTransaction[]> {
    try {
      const response = await fetch.get(`${API.GET_DATA_HISTORY}?userId=${userId}`, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching data top-up history:', error);
      throw error;
    }
  }

  // Lấy lịch sử nạp data (paginated)
  async getDataTopUpHistoryPaginated(
    userId: number, 
    page: number = 0, 
    size: number = 20,
    sort: string = 'createdAt,desc'
  ): Promise<DataTopUpHistoryResponse> {
    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
        page: page.toString(),
        size: size.toString(),
        sort: sort
      });
      
      const response = await fetch.get(`${API.GET_DATA_HISTORY_PAGINATED}?${params}`, {}, true);
      return response;
    } catch (error) {
      console.error('Error fetching paginated data top-up history:', error);
      throw error;
    }
  }

  // Tự động nhận diện nhà mạng từ số điện thoại (tái sử dụng logic từ MobilePrepaidService)
  detectProviderFromPhoneNumber(phoneNumber: string): string | null {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) return null;
    
    const prefix = cleanPhone.substring(0, 3);
    
    // Mapping prefix với provider code
    const prefixMapping: Record<string, string> = {
      // Viettel
      '086': 'VIETTEL', '096': 'VIETTEL', '097': 'VIETTEL', '098': 'VIETTEL',
      '032': 'VIETTEL', '033': 'VIETTEL', '034': 'VIETTEL', '035': 'VIETTEL',
      '036': 'VIETTEL', '037': 'VIETTEL', '038': 'VIETTEL', '039': 'VIETTEL',
      
      // VinaPhone
      '088': 'VINAPHONE', '091': 'VINAPHONE', '094': 'VINAPHONE',
      '083': 'VINAPHONE', '084': 'VINAPHONE', '085': 'VINAPHONE',
      '081': 'VINAPHONE', '082': 'VINAPHONE',
      
      // MobiFone
      '089': 'MOBIFONE', '090': 'MOBIFONE', '093': 'MOBIFONE',
      '070': 'MOBIFONE', '079': 'MOBIFONE', '077': 'MOBIFONE',
      '076': 'MOBIFONE', '078': 'MOBIFONE',
      
      // Vietnamobile
      '092': 'VIETNAMOBILE', '056': 'VIETNAMOBILE', '058': 'VIETNAMOBILE'
    };
    
    return prefixMapping[prefix] || null;
  }

  // Validate số điện thoại Việt Nam
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneRegex = /^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
  }

  // Format số điện thoại
  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('84')) {
      return '0' + cleanPhone.substring(2);
    }
    return cleanPhone;
  }

  // Lọc gói data theo giá
  filterPackagesByPrice(packages: DataPackage[], minPrice?: number, maxPrice?: number): DataPackage[] {
    return packages.filter(pkg => {
      if (minPrice !== undefined && pkg.price < minPrice) return false;
      if (maxPrice !== undefined && pkg.price > maxPrice) return false;
      return true;
    });
  }

  // Sắp xếp gói data
  sortPackages(packages: DataPackage[], sortBy: 'price' | 'dataAmount' | 'validityDays' = 'price'): DataPackage[] {
    return [...packages].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'dataAmount':
          return a.dataAmount - b.dataAmount;
        case 'validityDays':
          return a.validityDays - b.validityDays;
        default:
          return a.sortOrder - b.sortOrder;
      }
    });
  }

  // Format dung lượng data
  formatDataAmount(dataAmountMB: number): string {
    if (dataAmountMB >= 1024) {
      const gb = dataAmountMB / 1024;
      return gb % 1 === 0 ? `${gb}GB` : `${gb.toFixed(1)}GB`;
    }
    return `${dataAmountMB}MB`;
  }

  // Format thời hạn
  formatValidity(days: number): string {
    if (days === 1) return '1 ngày';
    if (days === 7) return '1 tuần';
    if (days === 30) return '1 tháng';
    if (days === 365) return '1 năm';
    return `${days} ngày`;
  }
}

export default new Data4GService();