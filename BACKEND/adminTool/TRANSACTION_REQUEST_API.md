# Transaction Request Management API

## Overview
API để quản lý và truy vấn danh sách transaction requests từ DB_TRANSACTION_SERVICE thông qua AdminTool với hỗ trợ phân trang và filter nâng cao.

## Base URL
```
http://localhost:7999
```

## Authentication
Tất cả các endpoint yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Transaction Requests List (Advanced with Filters)
Lấy danh sách transaction requests với phân trang và filter nâng cao.

**Endpoint:** `GET /api/transaction-requests`

**Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Số lượng records mỗi trang (default: 20, max: 1000)
- `fromDate` (optional): Ngày bắt đầu (format: YYYY-MM-DD)
- `toDate` (optional): Ngày kết thúc (format: YYYY-MM-DD)
- `status` (optional): Trạng thái giao dịch (PENDING, COMPLETED, FAILED, CANCELLED)
- `referenceNumber` (optional): Mã tham chiếu (hỗ trợ tìm kiếm partial)
- `minAmount` (optional): Số tiền tối thiểu
- `maxAmount` (optional): Số tiền tối đa
- `transactionType` (optional): Loại giao dịch (TRANSFER, DEPOSIT, WITHDRAWAL, etc.)
- `userId` (optional): ID người dùng
- `fromAccount` (optional): Tài khoản nguồn (hỗ trợ tìm kiếm partial)
- `toAccount` (optional): Tài khoản đích (hỗ trợ tìm kiếm partial)
- `sortBy` (optional): Trường sắp xếp (id, created_at, updated_at, amount, status, transaction_type) (default: created_at)
- `sortDirection` (optional): Hướng sắp xếp (ASC, DESC) (default: DESC)

**Example Requests:**

1. **Basic pagination:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?page=0&size=10" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

2. **Filter by date range:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?fromDate=2024-12-01&toDate=2024-12-31&page=0&size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

3. **Filter by status:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?status=COMPLETED&page=0&size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

4. **Filter by amount range:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?minAmount=100000&maxAmount=5000000&page=0&size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

5. **Filter by reference number:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?referenceNumber=TXN2024&page=0&size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

6. **Combined filters:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&minAmount=100000&sortBy=amount&sortDirection=ASC&page=0&size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
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

### 2. Get Transaction Requests List (Legacy)
Endpoint cũ để tương thích ngược.

**Endpoint:** `GET /api/transaction-requests/legacy`

**Parameters:**
- `size` (optional): Số lượng records muốn lấy (default: 20, max: 1000)

**Example Request:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests/legacy?size=20" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "data": [...],
  "total": 150,
  "size": 20,
  "count": 20
}
```

### 3. Get Transaction Request by ID
Lấy thông tin chi tiết của một transaction request.

**Endpoint:** `GET /api/transaction-requests/{id}`

**Parameters:**
- `id` (required): ID của transaction request

**Example Request:**
```bash
curl -X GET "http://localhost:7999/api/transaction-requests/1" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
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

## Filter Parameters Details

### Date Filters
- **fromDate**: Lọc các giao dịch từ ngày này trở đi (format: YYYY-MM-DD)
- **toDate**: Lọc các giao dịch đến ngày này (format: YYYY-MM-DD)

### Status Values
- `PENDING`: Đang chờ xử lý
- `COMPLETED`: Hoàn thành
- `FAILED`: Thất bại
- `CANCELLED`: Đã hủy

### Transaction Types
- `TRANSFER`: Chuyển khoản
- `DEPOSIT`: Nạp tiền
- `WITHDRAWAL`: Rút tiền
- `PAYMENT`: Thanh toán
- `TOPUP`: Nạp thẻ

### Amount Range
- **minAmount**: Số tiền tối thiểu (BigDecimal)
- **maxAmount**: Số tiền tối đa (BigDecimal)

### Sorting Options
- **sortBy**: `id`, `created_at`, `updated_at`, `amount`, `status`, `transaction_type`
- **sortDirection**: `ASC` (tăng dần), `DESC` (giảm dần)

## Pagination Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | Array | Danh sách transaction requests |
| totalElements | Long | Tổng số records |
| totalPages | Integer | Tổng số trang |
| currentPage | Integer | Trang hiện tại (0-based) |
| pageSize | Integer | Số records mỗi trang |
| hasNext | Boolean | Có trang tiếp theo không |
| hasPrevious | Boolean | Có trang trước không |
| first | Boolean | Có phải trang đầu không |
| last | Boolean | Có phải trang cuối không |

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "path": "/api/transaction-requests"
}
```

### 404 Not Found (for specific ID)
```json
{
  "error": "Transaction request not found",
  "found": false
}
```

### 500 Internal Server Error
```json
{
  "data": [],
  "totalElements": 0,
  "totalPages": 0,
  "currentPage": 0,
  "pageSize": 20,
  "hasNext": false,
  "hasPrevious": false,
  "first": true,
  "last": true
}
```

## Advanced Usage Examples

### 1. Tìm tất cả giao dịch COMPLETED trong tháng 12/2024
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&toDate=2024-12-31&page=0&size=50" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Tìm giao dịch có số tiền từ 1 triệu đến 10 triệu, sắp xếp theo số tiền tăng dần
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?minAmount=1000000&maxAmount=10000000&sortBy=amount&sortDirection=ASC&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Tìm giao dịch theo reference number (partial match)
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?referenceNumber=TXN2024&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Tìm giao dịch của user cụ thể
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?userId=user123&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Tìm giao dịch từ tài khoản cụ thể
```bash
curl -X GET "http://localhost:7999/api/transaction-requests?fromAccount=123456&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```