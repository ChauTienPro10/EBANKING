# Data 4G API Documentation - Auth Service

## Overview
API gateway trong authService để gọi các API nạp data 4G từ transactionService. Tất cả các request sẽ được xác thực và forward đến transactionService.

## Base URL
```
/authService/data-topup
```

## Authentication
Tất cả các endpoint yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Lấy danh sách tất cả gói data

**GET** `/packages`

**Response:**
```json
[
  {
    "packageId": 1,
    "providerId": 1,
    "providerCode": "VIETTEL",
    "providerName": "Viettel",
    "packageCode": "VT_D1GB_1D",
    "packageName": "Gói 4G 1GB/ngày",
    "dataAmount": 1024,
    "formattedDataAmount": "1GB",
    "validityDays": 1,
    "price": 15000,
    "description": "Gói data 4G 1GB sử dụng trong 1 ngày",
    "isActive": true,
    "sortOrder": 1
  }
]
```

### 2. Lấy gói data theo nhà mạng

**GET** `/packages/provider/{providerId}`

**Parameters:**
- `providerId` (path): ID của nhà mạng

**GET** `/packages/provider-code/{providerCode}`

**Parameters:**
- `providerCode` (path): Mã nhà mạng (VIETTEL, VINAPHONE, MOBIFONE)

### 3. Lấy thông tin gói data

**GET** `/packages/{packageId}`

**Parameters:**
- `packageId` (path): ID của gói data

**GET** `/packages/code/{packageCode}`

**Parameters:**
- `packageCode` (path): Mã gói data

### 4. Lấy gói data theo khoảng giá

**GET** `/packages/provider/{providerId}/price-range`

**Parameters:**
- `providerId` (path): ID của nhà mạng
- `minPrice` (query): Giá tối thiểu
- `maxPrice` (query): Giá tối đa

### 5. Khởi tạo nạp data 4G

**POST** `/initiate`

**Headers:**
- `Authorization`: Bearer JWT token

**Request Body:**
```json
{
  "userId": 1,
  "username": "testuser",
  "phoneNumber": "0987654321",
  "packageId": 1,
  "accountNumber": "1234567890",
  "pin": "123456",
  "requiresFaceAuth": false,
  "faceAuthSessionId": "uuid-session-id"
}
```

**Response:**
```json
{
  "dataTopUpId": 1,
  "transactionId": "DATA_1703123456789_ABC12345",
  "phoneNumber": "0987654321",
  "telecomProvider": "Viettel",
  "packageName": "Gói 4G 1GB/ngày",
  "formattedDataAmount": "1GB",
  "validityDays": 1,
  "amount": 15000,
  "currency": "VND",
  "status": "COMPLETED",
  "providerTransactionId": "PROVIDER_1703123456789",
  "failureReason": null,
  "createdAt": "2023-12-21T10:30:45",
  "completedAt": "2023-12-21T10:30:50",
  "requiresFaceAuth": false,
  "faceAuthSessionId": null,
  "faceAuthVerified": false
}
```

### 6. Xác thực khuôn mặt và xử lý

**POST** `/verify-face-auth`

**Request Body:**
```json
{
  "transactionId": "DATA_1703123456789_ABC12345",
  "faceAuthSessionId": "uuid-session-id"
}
```

### 7. Lấy thông tin giao dịch

**GET** `/transaction/{transactionId}`

**Parameters:**
- `transactionId` (path): ID giao dịch

### 8. Lấy lịch sử nạp data

**GET** `/history`

**Headers:**
- `Authorization`: Bearer JWT token

**Parameters:**
- `userId` (query): ID người dùng

**GET** `/history/paginated`

**Headers:**
- `Authorization`: Bearer JWT token

**Parameters:**
- `userId` (query): ID người dùng
- `page` (query): Số trang (default: 0)
- `size` (query): Kích thước trang (default: 20)
- `sort` (query): Sắp xếp (default: createdAt,desc)

## Error Responses

```json
{
  "error": "INSUFFICIENT_BALANCE",
  "message": "Insufficient balance"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Token không hợp lệ hoặc hết hạn
- `PACKAGE_NOT_FOUND`: Không tìm thấy gói data
- `ACCOUNT_NOT_FOUND`: Không tìm thấy tài khoản
- `INSUFFICIENT_BALANCE`: Số dư không đủ
- `INVALID_PHONE_NUMBER`: Số điện thoại không hợp lệ
- `PROVIDER_MISMATCH`: Nhà mạng không khớp
- `FACE_AUTH_REQUIRED`: Yêu cầu xác thực khuôn mặt
- `FACE_AUTH_FAILED`: Xác thực khuôn mặt thất bại

## Sample Integration

### Frontend JavaScript Example

```javascript
// 1. Lấy danh sách gói data theo nhà mạng
async function getDataPackages(providerCode) {
  const response = await fetch(`/authService/data-topup/packages/provider-code/${providerCode}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  });
  return await response.json();
}

// 2. Khởi tạo nạp data
async function initiateDataTopUp(requestData) {
  const response = await fetch('/authService/data-topup/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify(requestData)
  });
  return await response.json();
}

// 3. Lấy lịch sử nạp data
async function getDataTopUpHistory(userId) {
  const response = await fetch(`/authService/data-topup/history?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  });
  return await response.json();
}

// Example usage
const packages = await getDataPackages('VIETTEL');
console.log('Available packages:', packages);

const topUpRequest = {
  userId: 1,
  username: 'testuser',
  phoneNumber: '0987654321',
  packageId: 1,
  accountNumber: '1234567890',
  requiresFaceAuth: false
};

const result = await initiateDataTopUp(topUpRequest);
console.log('Top-up result:', result);
```

### Mobile App Example (React Native)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class DataTopUpService {
  constructor() {
    this.baseUrl = 'https://your-api-domain.com/authService/data-topup';
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('jwt_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getDataPackagesByProvider(providerCode) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/packages/provider-code/${providerCode}`, {
      headers
    });
    return await response.json();
  }

  async initiateDataTopUp(requestData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/initiate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
    return await response.json();
  }

  async getHistory(userId, page = 0, size = 20) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/history/paginated?userId=${userId}&page=${page}&size=${size}`,
      { headers }
    );
    return await response.json();
  }
}

// Usage
const dataTopUpService = new DataTopUpService();

// Get packages for Viettel
const viettelPackages = await dataTopUpService.getDataPackagesByProvider('VIETTEL');

// Initiate top-up
const topUpResult = await dataTopUpService.initiateDataTopUp({
  userId: 1,
  username: 'user123',
  phoneNumber: '0987654321',
  packageId: 1,
  accountNumber: '1234567890'
});
```

## Testing with cURL

```bash
# Set JWT token
JWT_TOKEN="your_jwt_token_here"

# 1. Get all data packages
curl -X GET "http://localhost:8080/authService/data-topup/packages" \
  -H "Authorization: Bearer $JWT_TOKEN"

# 2. Get packages by provider
curl -X GET "http://localhost:8080/authService/data-topup/packages/provider-code/VIETTEL" \
  -H "Authorization: Bearer $JWT_TOKEN"

# 3. Initiate data top-up
curl -X POST "http://localhost:8080/authService/data-topup/initiate" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "username": "testuser",
    "phoneNumber": "0987654321",
    "packageId": 1,
    "accountNumber": "1234567890",
    "requiresFaceAuth": false
  }'

# 4. Get history
curl -X GET "http://localhost:8080/authService/data-topup/history?userId=1" \
  -H "Authorization: Bearer $JWT_TOKEN"

# 5. Get transaction details
curl -X GET "http://localhost:8080/authService/data-topup/transaction/DATA_1703123456789_ABC12345" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Security Notes

1. **JWT Validation**: Tất cả requests đều được validate JWT token
2. **User Authorization**: Chỉ user sở hữu tài khoản mới có thể thực hiện giao dịch
3. **Request Forwarding**: AuthService chỉ forward request, không lưu trữ dữ liệu giao dịch
4. **Error Handling**: Lỗi từ transactionService được forward về client với proper HTTP status codes

## Flow Diagram

```
Client App → AuthService → TransactionService → Database
    ↓           ↓              ↓
JWT Auth → Validate User → Process Transaction
    ↓           ↓              ↓
Response ← Format Response ← Transaction Result
```