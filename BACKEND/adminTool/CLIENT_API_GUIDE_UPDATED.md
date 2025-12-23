# Transaction Request API - Client Guide (Updated)

## 🚀 Quick Start

### Base URL
```
http://localhost:7999
```

### Authentication
Tất cả API cần JWT token trong header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 API Endpoints

### 1. 🔐 Login (Lấy JWT Token)
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800
}
```

---

### 2. 📊 Lấy Danh Sách Transaction Requests

#### Basic Call (Mặc định)
```http
GET /api/transaction-requests
Authorization: Bearer YOUR_JWT_TOKEN
```

#### With Pagination
```http
GET /api/transaction-requests?page=0&size=20
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Filter by Date Range
```http
GET /api/transaction-requests?fromDate=2024-12-01&toDate=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Filter by Status
```http
GET /api/transaction-requests?status=COMPLETED
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Filter by Amount Range
```http
GET /api/transaction-requests?minAmount=100000&maxAmount=5000000
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Filter by Request Number
```http
GET /api/transaction-requests?requestNumber=REQ2024
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Filter by Request Type
```http
GET /api/transaction-requests?requestType=CASH_DEPOSIT
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Combined Filters
```http
GET /api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&minAmount=100000&requestType=CASH_DEPOSIT&sortBy=amount&sortDirection=ASC&page=0&size=20
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 3. 📊 Lấy Thống Kê Transaction Requests
```http
GET /api/transaction-requests/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "totalRequests": 1250,
  "statusBreakdown": {
    "PENDING": 45,
    "APPROVED": 20,
    "COMPLETED": 1150,
    "REJECTED": 35
  },
  "typeBreakdown": {
    "CASH_DEPOSIT": 800,
    "CASH_WITHDRAWAL": 450
  }
}
```

---

### 4. 🔍 Lấy Chi Tiết Transaction Request
```http
GET /api/transaction-requests/{requestId}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 5. ✅ Approve Transaction Request
```http
POST /api/transaction-requests/{requestId}/approve?adminUsername=admin
Authorization: Bearer YOUR_JWT_TOKEN
```

**Parameters:**
- `requestId` (path): ID của transaction request
- `adminUsername` (query): Tên admin thực hiện approve

**Response:**
```json
{
  "data": {
    "requestId": 1,
    "requestNumber": "REQ123456789",
    "userId": 123,
    "savingsAccountId": 456,
    "requestType": "CASH_DEPOSIT",
    "amount": 5000000.00,
    "currency": "VND",
    "status": "APPROVED",
    "description": "Nạp tiền mặt vào tài khoản tiết kiệm",
    "rejectionReason": null,
    "requestedAt": "2024-12-21 14:30:00",
    "processedAt": "2024-12-24 10:15:00",
    "processedBy": "admin",
    "createdAt": "2024-12-21 14:30:00",
    "updatedAt": "2024-12-24 10:15:00"
  },
  "success": true,
  "message": "Transaction request approved successfully",
  "newBalance": 15000000.00,
  "transactionType": "CASH_DEPOSIT",
  "amount": 5000000.00
}
```

**⚠️ Lưu ý quan trọng:**
- **CASH_DEPOSIT**: Số tiền sẽ được cộng vào tài khoản tiết kiệm
- **CASH_WITHDRAWAL**: Số tiền sẽ được trừ từ tài khoản tiết kiệm
- Hệ thống sẽ kiểm tra số dư trước khi thực hiện withdrawal
- Nếu số dư không đủ, giao dịch sẽ bị từ chối

---

### 6. ❌ Reject Transaction Request
```http
POST /api/transaction-requests/{requestId}/reject?adminUsername=admin&rejectionReason=Insufficient documentation
Authorization: Bearer YOUR_JWT_TOKEN
```

**Parameters:**
- `requestId` (path): ID của transaction request
- `adminUsername` (query): Tên admin thực hiện reject
- `rejectionReason` (query): Lý do từ chối

**Response:**
```json
{
  "data": {
    "requestId": 1,
    "requestNumber": "REQ123456789",
    "userId": 123,
    "savingsAccountId": 456,
    "requestType": "CASH_DEPOSIT",
    "amount": 5000000.00,
    "currency": "VND",
    "status": "REJECTED",
    "description": "Nạp tiền mặt vào tài khoản tiết kiệm",
    "rejectionReason": "Insufficient documentation",
    "requestedAt": "2024-12-21 14:30:00",
    "processedAt": "2024-12-24 10:15:00",
    "processedBy": "admin",
    "createdAt": "2024-12-21 14:30:00",
    "updatedAt": "2024-12-24 10:15:00"
  },
  "success": true,
  "message": "Transaction request rejected successfully"
}
```

---

## 📝 Parameters Reference

### Pagination
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 0 | Số trang (bắt đầu từ 0) |
| `size` | int | 20 | Số records mỗi trang (max: 1000) |

### Date Filters
| Parameter | Type | Format | Description |
|-----------|------|--------|-------------|
| `fromDate` | string | YYYY-MM-DD | Từ ngày (dựa trên requested_at) |
| `toDate` | string | YYYY-MM-DD | Đến ngày (dựa trên requested_at) |

### Other Filters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Trạng thái yêu cầu | PENDING, APPROVED, REJECTED, COMPLETED |
| `requestNumber` | string | Mã yêu cầu (partial match) | REQ2024 |
| `minAmount` | decimal | Số tiền tối thiểu | 100000 |
| `maxAmount` | decimal | Số tiền tối đa | 5000000 |
| `requestType` | string | Loại yêu cầu | CASH_DEPOSIT, CASH_WITHDRAWAL |
| `userId` | long | ID người dùng | 123 |
| `savingsAccountId` | long | ID tài khoản tiết kiệm | 456 |
| `processedBy` | string | Người xử lý (partial match) | admin |

### Sorting
| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `sortBy` | string | created_at | request_id, created_at, updated_at, requested_at, amount, status, request_type |
| `sortDirection` | string | DESC | ASC, DESC |

---

## 📄 Response Format

### Paginated Response
```json
{
  "data": [
    {
      "requestId": 1,
      "requestNumber": "REQ123456789",
      "userId": 123,
      "savingsAccountId": 456,
      "requestType": "CASH_DEPOSIT",
      "amount": 5000000.00,
      "currency": "VND",
      "status": "COMPLETED",
      "description": "Nạp tiền mặt vào tài khoản tiết kiệm",
      "rejectionReason": null,
      "requestedAt": "2024-12-21 14:30:00",
      "processedAt": "2024-12-21 15:00:00",
      "processedBy": "admin",
      "createdAt": "2024-12-21 14:30:00",
      "updatedAt": "2024-12-21 15:00:00"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "pageSize": 20,
  "hasNext": true,
  "hasPrevious": false,
  "first": true,
  "last": false
}
```

### Single Record Response
```json
{
  "data": {
    "requestId": 1,
    "requestNumber": "REQ123456789",
    "userId": 123,
    "savingsAccountId": 456,
    "requestType": "CASH_DEPOSIT",
    "amount": 5000000.00,
    "currency": "VND",
    "status": "COMPLETED",
    "description": "Nạp tiền mặt vào tài khoản tiết kiệm",
    "rejectionReason": null,
    "requestedAt": "2024-12-21 14:30:00",
    "processedAt": "2024-12-21 15:00:00",
    "processedBy": "admin",
    "createdAt": "2024-12-21 14:30:00",
    "updatedAt": "2024-12-21 15:00:00"
  },
  "found": true
}
```

---

## 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| requestId | Long | ID duy nhất của transaction request |
| requestNumber | String | Mã số yêu cầu giao dịch |
| userId | Long | ID người dùng thực hiện yêu cầu |
| savingsAccountId | Long | ID tài khoản tiết kiệm |
| requestType | String | Loại yêu cầu (CASH_DEPOSIT, CASH_WITHDRAWAL) |
| amount | BigDecimal | Số tiền giao dịch |
| currency | String | Đơn vị tiền tệ (VND) |
| status | String | Trạng thái (PENDING, APPROVED, REJECTED, COMPLETED) |
| description | String | Mô tả yêu cầu |
| rejectionReason | String | Lý do từ chối (nếu có) |
| requestedAt | DateTime | Thời gian tạo yêu cầu |
| processedAt | DateTime | Thời gian xử lý |
| processedBy | String | Người xử lý |
| createdAt | DateTime | Thời gian tạo record |
| updatedAt | DateTime | Thời gian cập nhật cuối |

---

## 💻 Code Examples

### JavaScript/Fetch
```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:7999/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin@123'
  })
});
const { token } = await loginResponse.json();

// 2. Get transactions
const transactionsResponse = await fetch('http://localhost:7999/api/transaction-requests?page=0&size=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const transactions = await transactionsResponse.json();
```

### JavaScript/Axios
```javascript
// 1. Login
const loginResponse = await axios.post('http://localhost:7999/api/admin/auth/login', {
  username: 'admin',
  password: 'admin@123'
});
const token = loginResponse.data.token;

// 2. Get transactions with filters
const transactionsResponse = await axios.get('http://localhost:7999/api/transaction-requests', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  params: {
    page: 0,
    size: 20,
    status: 'COMPLETED',
    requestType: 'CASH_DEPOSIT',
    fromDate: '2024-12-01',
    toDate: '2024-12-31'
  }
});
const transactions = transactionsResponse.data;

// 3. Approve transaction request
const approveResponse = await axios.post(`http://localhost:7999/api/transaction-requests/1/approve`, null, {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  params: {
    adminUsername: 'admin'
  }
});
const approvedRequest = approveResponse.data;

// 4. Reject transaction request
const rejectResponse = await axios.post(`http://localhost:7999/api/transaction-requests/2/reject`, null, {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  params: {
    adminUsername: 'admin',
    rejectionReason: 'Insufficient documentation'
  }
});
const rejectedRequest = rejectResponse.data;
```

### cURL
```bash
# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:7999/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}' | jq -r '.token')

# 2. Get transactions
curl -X GET "http://localhost:7999/api/transaction-requests?page=0&size=20&status=COMPLETED" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 3. Approve transaction request
curl -X POST "http://localhost:7999/api/transaction-requests/1/approve?adminUsername=admin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 4. Reject transaction request
curl -X POST "http://localhost:7999/api/transaction-requests/2/reject?adminUsername=admin&rejectionReason=Insufficient%20documentation" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Python/Requests
```python
import requests

# 1. Login
login_response = requests.post('http://localhost:7999/api/admin/auth/login', 
  json={
    'username': 'admin',
    'password': 'admin@123'
  }
)
token = login_response.json()['token']

# 2. Get transactions
headers = {
  'Authorization': f'Bearer {token}',
  'Content-Type': 'application/json'
}
params = {
  'page': 0,
  'size': 20,
  'status': 'COMPLETED',
  'requestType': 'CASH_DEPOSIT',
  'fromDate': '2024-12-01',
  'toDate': '2024-12-31'
}
transactions_response = requests.get('http://localhost:7999/api/transaction-requests', 
  headers=headers, params=params)
transactions = transactions_response.json()
```

---

## 🎯 Common Use Cases

### 1. Lấy 20 yêu cầu mới nhất
```http
GET /api/transaction-requests?page=0&size=20&sortBy=requested_at&sortDirection=DESC
```

### 2. Tìm yêu cầu hoàn thành trong tháng
```http
GET /api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&toDate=2024-12-31
```

### 3. Tìm yêu cầu nạp tiền lớn (>= 1 triệu)
```http
GET /api/transaction-requests?requestType=CASH_DEPOSIT&minAmount=1000000&sortBy=amount&sortDirection=DESC
```

### 4. Tìm theo mã yêu cầu
```http
GET /api/transaction-requests?requestNumber=REQ20241224
```

### 5. Tìm yêu cầu của user cụ thể
```http
GET /api/transaction-requests?userId=123
```

### 6. Tìm yêu cầu đang chờ xử lý
```http
GET /api/transaction-requests?status=PENDING&sortBy=requested_at&sortDirection=ASC
```

### 7. Approve yêu cầu nạp tiền
```http
POST /api/transaction-requests/123/approve?adminUsername=admin
```

### 8. Reject yêu cầu với lý do
```http
POST /api/transaction-requests/456/reject?adminUsername=admin&rejectionReason=Invalid amount
```

---

## ⚠️ Error Handling

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Transaction request not found",
  "found": false
}
```

### 500 Server Error
```json
{
  "data": [],
  "totalElements": 0,
  "totalPages": 0,
  "currentPage": 0,
  "pageSize": 20
}
```

---

## 📞 Support

- **Port:** 7999
- **Environment:** Development
- **Database:** DB_TRANSACTION_SERVICE (table: transaction_request)
- **Authentication:** JWT Token (expires in 30 minutes)
- **Request Types:** CASH_DEPOSIT, CASH_WITHDRAWAL
- **Status Values:** PENDING, APPROVED, REJECTED, COMPLETED