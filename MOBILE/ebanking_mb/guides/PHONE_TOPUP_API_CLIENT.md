# API Nạp Tiền Điện Thoại - Tài Liệu Client

## Base URL
```
Production: https://api.ebanking.com
Development: http://localhost:8080
```

## Authentication
Tất cả API yêu cầu JWT token:
```
Authorization: Bearer <jwt_token>
```

## 1. Lấy Danh Sách Nhà Mạng

**GET** `/authService/phone-topup/providers`

### Headers
```
Content-Type: application/json
```

### Response
```json
[
  {
    "providerId": 1,
    "providerCode": "VIETTEL",
    "providerName": "Viettel",
    "logoUrl": "https://example.com/logos/viettel.png",
    "isActive": true,
    "minAmount": 10000,
    "maxAmount": 500000,
    "feePercentage": 0.5,
    "fixedFee": 1000,
    "denominations": [
      {
        "denominationId": 1,
        "amount": 10000,
        "displayName": "10,000 VND",
        "sortOrder": 1
      },
      {
        "denominationId": 2,
        "amount": 20000,
        "displayName": "20,000 VND",
        "sortOrder": 2
      },
      {
        "denominationId": 3,
        "amount": 50000,
        "displayName": "50,000 VND",
        "sortOrder": 3
      },
      {
        "denominationId": 4,
        "amount": 100000,
        "displayName": "100,000 VND",
        "sortOrder": 4
      }
    ]
  },
  {
    "providerId": 2,
    "providerCode": "MOBIFONE",
    "providerName": "Mobifone",
    "logoUrl": "https://example.com/logos/mobifone.png",
    "isActive": true,
    "minAmount": 10000,
    "maxAmount": 500000,
    "feePercentage": 0.5,
    "fixedFee": 1000,
    "denominations": [...]
  }
]
```

## 2. Thực Hiện Nạp Tiền

**POST** `/authService/phone-topup`

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "userId": 123,
  "username": "john_doe",
  "accountNumber": "1234567890",
  "phoneNumber": "0987654321",
  "telecomProvider": "VIETTEL",
  "amount": 50000,
  "pin": "123456",
  "requiresFaceAuth": false,
  "faceAuthSessionId": null
}
```

### Response - Thành Công
```json
{
  "topUpId": 1,
  "transactionId": "TOPUP_1703123456789_ABC12345",
  "phoneNumber": "0987654321",
  "telecomProvider": "VIETTEL",
  "amount": 50000,
  "currency": "VND",
  "status": "COMPLETED",
  "providerTransactionId": "VIETTEL_1703123456789",
  "failureReason": null,
  "createdAt": "2024-12-20T10:30:00",
  "completedAt": "2024-12-20T10:30:05",
  "requiresFaceAuth": false,
  "faceAuthSessionId": null,
  "faceAuthVerified": true
}
```

### Response - Cần Face Auth
```json
{
  "topUpId": 2,
  "transactionId": "TOPUP_1703123456790_DEF67890",
  "phoneNumber": "0987654321",
  "telecomProvider": "VIETTEL",
  "amount": 200000,
  "currency": "VND",
  "status": "PENDING",
  "providerTransactionId": null,
  "failureReason": null,
  "createdAt": "2024-12-20T10:35:00",
  "completedAt": null,
  "requiresFaceAuth": true,
  "faceAuthSessionId": "uuid-face-auth-session-123",
  "faceAuthVerified": false
}
```

## 3. Xác Thực Face Auth

**POST** `/authService/phone-topup/verify-face-auth/{faceAuthSessionId}`

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "topUpId": 2,
  "transactionId": "TOPUP_1703123456790_DEF67890",
  "phoneNumber": "0987654321",
  "telecomProvider": "VIETTEL",
  "amount": 200000,
  "currency": "VND",
  "status": "COMPLETED",
  "providerTransactionId": "VIETTEL_1703123456790",
  "failureReason": null,
  "createdAt": "2024-12-20T10:35:00",
  "completedAt": "2024-12-20T10:35:15",
  "requiresFaceAuth": true,
  "faceAuthSessionId": "uuid-face-auth-session-123",
  "faceAuthVerified": true
}
```

## 4. Lấy Lịch Sử Nạp Tiền

**GET** `/authService/phone-topup/history/{userId}?page=0&size=10`

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Query Parameters
- `page`: Số trang (bắt đầu từ 0)
- `size`: Số bản ghi mỗi trang (tối đa 100)

### Response
```json
{
  "content": [
    {
      "topUpId": 1,
      "transactionId": "TOPUP_1703123456789_ABC12345",
      "phoneNumber": "0987654321",
      "telecomProvider": "VIETTEL",
      "amount": 50000,
      "currency": "VND",
      "status": "COMPLETED",
      "providerTransactionId": "VIETTEL_1703123456789",
      "failureReason": null,
      "createdAt": "2024-12-20T10:30:00",
      "completedAt": "2024-12-20T10:30:05",
      "requiresFaceAuth": false,
      "faceAuthVerified": true
    },
    {
      "topUpId": 2,
      "transactionId": "TOPUP_1703123456790_DEF67890",
      "phoneNumber": "0987654321",
      "telecomProvider": "MOBIFONE",
      "amount": 100000,
      "currency": "VND",
      "status": "FAILED",
      "providerTransactionId": null,
      "failureReason": "Insufficient balance",
      "createdAt": "2024-12-20T09:15:00",
      "completedAt": null,
      "requiresFaceAuth": false,
      "faceAuthVerified": false
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

## 5. Lấy Chi Tiết Giao Dịch

**GET** `/authService/phone-topup/transaction/{transactionId}`

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "topUpId": 1,
  "transactionId": "TOPUP_1703123456789_ABC12345",
  "phoneNumber": "0987654321",
  "telecomProvider": "VIETTEL",
  "amount": 50000,
  "currency": "VND",
  "status": "COMPLETED",
  "providerTransactionId": "VIETTEL_1703123456789",
  "failureReason": null,
  "createdAt": "2024-12-20T10:30:00",
  "completedAt": "2024-12-20T10:30:05",
  "requiresFaceAuth": false,
  "faceAuthSessionId": null,
  "faceAuthVerified": true
}
```

## Mã Trạng Thái

### Transaction Status
- `PENDING`: Đang chờ xử lý (thường là chờ face auth)
- `PROCESSING`: Đang xử lý
- `COMPLETED`: Thành công
- `FAILED`: Thất bại

### Provider Codes
- `VIETTEL`: Viettel
- `MOBIFONE`: Mobifone  
- `VINAPHONE`: Vinaphone
- `VIETNAMOBILE`: Vietnamobile

## Xử Lý Lỗi

### HTTP Status Codes
- `200`: Thành công
- `400`: Dữ liệu không hợp lệ
- `401`: Chưa xác thực hoặc token hết hạn
- `403`: Không có quyền hoặc tài khoản bị khóa
- `404`: Không tìm thấy
- `500`: Lỗi server

### Error Response Format
```json
{
  "error": "Top-up failed",
  "message": "Insufficient balance"
}
```

### Account Locked Response (403)
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Tài khoản của bạn đã bị khóa và không thể thực hiện giao dịch",
  "username": "john_doe",
  "timestamp": 1703123456789,
  "status": 403,
  "lockReason": "Suspicious activity detected",
  "lockType": "ADMIN_LOCK",
  "lockedAt": "2024-12-20T08:00:00",
  "lockedBy": "admin"
}
```

## Validation Rules

### Phone Number
- Format: Số điện thoại Việt Nam (10-11 chữ số)
- Regex: `^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$`
- Examples: `0987654321`, `84987654321`

### Amount
- Minimum: Theo từng nhà mạng (thường 10,000 VND)
- Maximum: Theo từng nhà mạng (thường 500,000 VND)
- Type: Number (integer)

### Required Fields
- `userId`: ID người dùng
- `username`: Tên đăng nhập
- `accountNumber`: Số tài khoản nguồn
- `phoneNumber`: Số điện thoại cần nạp
- `telecomProvider`: Mã nhà mạng
- `amount`: Số tiền nạp
- `pin`: Mã PIN xác thực

## Luồng Xử Lý

### Luồng Cơ Bản (Không Face Auth)
1. Gọi API lấy danh sách nhà mạng
2. Người dùng chọn nhà mạng và nhập thông tin
3. Gọi API nạp tiền
4. Nhận kết quả `status: "COMPLETED"`

### Luồng Face Auth
1. Gọi API lấy danh sách nhà mạng
2. Người dùng chọn nhà mạng và nhập thông tin
3. Gọi API nạp tiền
4. Nhận kết quả `status: "PENDING"` và `requiresFaceAuth: true`
5. Thực hiện face authentication
6. Gọi API verify face auth với `faceAuthSessionId`
7. Nhận kết quả `status: "COMPLETED"`