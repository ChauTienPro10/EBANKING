# Transaction Request API - Client Guide

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

#### Filter by Reference Number
```http
GET /api/transaction-requests?referenceNumber=TXN2024
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Combined Filters
```http
GET /api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&minAmount=100000&sortBy=amount&sortDirection=ASC&page=0&size=20
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 3. 🔍 Lấy Chi Tiết Transaction Request
```http
GET /api/transaction-requests/{id}
Authorization: Bearer YOUR_JWT_TOKEN
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
| `fromDate` | string | YYYY-MM-DD | Từ ngày |
| `toDate` | string | YYYY-MM-DD | Đến ngày |

### Other Filters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Trạng thái giao dịch | COMPLETED, PENDING, FAILED, CANCELLED |
| `referenceNumber` | string | Mã tham chiếu (partial match) | TXN2024 |
| `minAmount` | decimal | Số tiền tối thiểu | 100000 |
| `maxAmount` | decimal | Số tiền tối đa | 5000000 |
| `transactionType` | string | Loại giao dịch | TRANSFER, DEPOSIT, WITHDRAWAL |
| `userId` | string | ID người dùng | user123 |
| `fromAccount` | string | Tài khoản nguồn (partial match) | 123456 |
| `toAccount` | string | Tài khoản đích (partial match) | 987654 |

### Sorting
| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `sortBy` | string | created_at | id, created_at, updated_at, amount, status, transaction_type |
| `sortDirection` | string | DESC | ASC, DESC |

---

## 📄 Response Format

### Paginated Response
```json
{
  "data": [
    {
      "id": 1,
      "transactionType": "TRANSFER",
      "amount": 1000000.00,
      "fromAccount": "123456789",
      "toAccount": "987654321",
      "description": "Chuyển tiền",
      "status": "COMPLETED",
      "userId": "user123",
      "createdAt": "2024-12-24 10:30:00",
      "updatedAt": "2024-12-24 10:35:00",
      "referenceNumber": "TXN20241224001",
      "bankCode": "VCB",
      "fee": 5000.00,
      "currency": "VND"
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
    "id": 1,
    "transactionType": "TRANSFER",
    "amount": 1000000.00,
    "fromAccount": "123456789",
    "toAccount": "987654321",
    "description": "Chuyển tiền",
    "status": "COMPLETED",
    "userId": "user123",
    "createdAt": "2024-12-24 10:30:00",
    "updatedAt": "2024-12-24 10:35:00",
    "referenceNumber": "TXN20241224001",
    "bankCode": "VCB",
    "fee": 5000.00,
    "currency": "VND"
  },
  "found": true
}
```

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
    fromDate: '2024-12-01',
    toDate: '2024-12-31'
  }
});
const transactions = transactionsResponse.data;
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
  'fromDate': '2024-12-01',
  'toDate': '2024-12-31'
}
transactions_response = requests.get('http://localhost:7999/api/transaction-requests', 
  headers=headers, params=params)
transactions = transactions_response.json()
```

---

## 🎯 Common Use Cases

### 1. Lấy 20 giao dịch mới nhất
```http
GET /api/transaction-requests?page=0&size=20&sortBy=created_at&sortDirection=DESC
```

### 2. Tìm giao dịch hoàn thành trong tháng
```http
GET /api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&toDate=2024-12-31
```

### 3. Tìm giao dịch lớn (>= 1 triệu)
```http
GET /api/transaction-requests?minAmount=1000000&sortBy=amount&sortDirection=DESC
```

### 4. Tìm theo mã giao dịch
```http
GET /api/transaction-requests?referenceNumber=TXN20241224
```

### 5. Tìm giao dịch của user cụ thể
```http
GET /api/transaction-requests?userId=user123
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
- **Database:** DB_TRANSACTION_SERVICE
- **Authentication:** JWT Token (expires in 30 minutes)