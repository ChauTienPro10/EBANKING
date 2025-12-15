# Statistics API Specification

> [!IMPORTANT]
> Tài liệu này mô tả chi tiết các API endpoints cần thiết cho trang **Thống kê** (Statistics). Backend developers cần implement các endpoints này để frontend có thể hiển thị dữ liệu thống kê giao dịch.

## Tổng quan

Trang thống kê hiển thị phân tích giao dịch của người dùng theo các khoảng thời gian khác nhau (tuần, tháng, năm). Hệ thống cần cung cấp:

- Tổng quan giao dịch (số lượng, tổng tiền vào/ra)
- So sánh với kỳ trước
- Biểu đồ xu hướng
- Top insights (giao dịch lớn nhất, người nhận thường xuyên nhất)

---

## 1. Data Structures

### 1.1 TransferResponse (Đã có sẵn)

```typescript
interface TransferResponse {
  transactionId: number; // ID giao dịch
  senderAccountNumber: string; // Số tài khoản người gửi
  receiverAccountNumber: string; // Số tài khoản người nhận
  amount: number; // Số tiền giao dịch
  currency: string; // Loại tiền tệ (VND, USD, etc.)
  transactionType: string; // Loại giao dịch (SEND, RECEIVE)
  description: string; // Mô tả giao dịch
  status: string; // Trạng thái (SUCCESS, PENDING, FAILED)
  transactionAt: string; // Thời gian giao dịch (ISO 8601 format)
  balance?: number; // Số dư sau giao dịch (optional)
}
```

### 1.2 PeriodStats (Response từ API thống kê)

```typescript
interface PeriodStats {
  totalTransactions: number; // Tổng số giao dịch
  totalIncoming: number; // Tổng tiền vào
  totalOutgoing: number; // Tổng tiền ra
  largestTransaction: TransferResponse | null; // Giao dịch lớn nhất
  mostFrequentRecipient: {
    accountNumber: string; // Số tài khoản người nhận
    count: number; // Số lần giao dịch
    totalAmount: number; // Tổng tiền đã chuyển
  } | null;
  averageTransaction: number; // Trung bình mỗi giao dịch
}
```

### 1.3 ComparisonData (So sánh với kỳ trước)

```typescript
interface ComparisonData {
  current: PeriodStats; // Thống kê kỳ hiện tại
  previous: PeriodStats; // Thống kê kỳ trước
  percentageChange: {
    transactions: number; // % thay đổi số lượng giao dịch
    incoming: number; // % thay đổi tiền vào
    outgoing: number; // % thay đổi tiền ra
  };
}
```

### 1.4 TrendData (Dữ liệu biểu đồ xu hướng)

```typescript
interface TrendData {
  labels: string[]; // Nhãn trục X (ngày/tuần/tháng)
  incomingData: number[]; // Dữ liệu tiền vào theo thời gian
  outgoingData: number[]; // Dữ liệu tiền ra theo thời gian
}
```

---

## 2. API Endpoints

### 2.1 Lấy thống kê theo khoảng thời gian

**Endpoint:** `GET /api/statistics/period`

**Mô tả:** Lấy thống kê giao dịch cho một khoảng thời gian cụ thể

**Query Parameters:**

| Parameter       | Type   | Required | Description                       | Example                 |
| --------------- | ------ | -------- | --------------------------------- | ----------------------- |
| `username`      | string | ✅       | Tên đăng nhập                     | `john_doe`              |
| `accountNumber` | string | ✅       | Số tài khoản                      | `1234567890123456`      |
| `period`        | string | ✅       | Loại khoảng thời gian             | `week`, `month`, `year` |
| `offset`        | number | ❌       | Lùi về kỳ trước (0 = kỳ hiện tại) | `0`, `1`, `2`           |
| `startDate`     | string | ❌       | Ngày bắt đầu (ISO 8601)           | `2025-12-01T00:00:00Z`  |
| `endDate`       | string | ❌       | Ngày kết thúc (ISO 8601)          | `2025-12-31T23:59:59Z`  |

> [!NOTE]
>
> - Nếu `startDate` và `endDate` được cung cấp, sẽ ưu tiên sử dụng khoảng thời gian này thay vì `period` + `offset`
> - `offset = 0`: kỳ hiện tại, `offset = 1`: kỳ trước, `offset = 2`: 2 kỳ trước

**Response:**

```json
{
  "success": true,
  "data": {
    "totalTransactions": 45,
    "totalIncoming": 15000000,
    "totalOutgoing": 8500000,
    "largestTransaction": {
      "transactionId": 3005,
      "senderAccountNumber": "1234567890123456",
      "receiverAccountNumber": "9876543210987654",
      "amount": 5000000,
      "currency": "VND",
      "transactionType": "SEND",
      "description": "Thanh toán tiền nhà",
      "status": "SUCCESS",
      "transactionAt": "2025-12-10T14:30:00Z",
      "balance": 10000000
    },
    "mostFrequentRecipient": {
      "accountNumber": "2345678901234567",
      "count": 8,
      "totalAmount": 2400000
    },
    "averageTransaction": 522222
  },
  "message": "Statistics retrieved successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid period parameter",
  "message": "Period must be one of: week, month, year"
}
```

---

### 2.2 So sánh với kỳ trước

**Endpoint:** `GET /api/statistics/comparison`

**Mô tả:** Lấy dữ liệu so sánh giữa kỳ hiện tại và kỳ trước

**Query Parameters:**

| Parameter       | Type   | Required | Description           | Example                 |
| --------------- | ------ | -------- | --------------------- | ----------------------- |
| `username`      | string | ✅       | Tên đăng nhập         | `john_doe`              |
| `accountNumber` | string | ✅       | Số tài khoản          | `1234567890123456`      |
| `period`        | string | ✅       | Loại khoảng thời gian | `week`, `month`, `year` |

**Response:**

```json
{
  "success": true,
  "data": {
    "current": {
      "totalTransactions": 45,
      "totalIncoming": 15000000,
      "totalOutgoing": 8500000,
      "largestTransaction": {
        /* ... */
      },
      "mostFrequentRecipient": {
        /* ... */
      },
      "averageTransaction": 522222
    },
    "previous": {
      "totalTransactions": 38,
      "totalIncoming": 12000000,
      "totalOutgoing": 9000000,
      "largestTransaction": {
        /* ... */
      },
      "mostFrequentRecipient": {
        /* ... */
      },
      "averageTransaction": 552631
    },
    "percentageChange": {
      "transactions": 18.42,
      "incoming": 25.0,
      "outgoing": -5.56
    }
  },
  "message": "Comparison data retrieved successfully"
}
```

---

### 2.3 Lấy dữ liệu xu hướng (Trend Chart)

**Endpoint:** `GET /api/statistics/trend`

**Mô tả:** Lấy dữ liệu cho biểu đồ xu hướng theo thời gian

**Query Parameters:**

| Parameter       | Type   | Required | Description           | Example                 |
| --------------- | ------ | -------- | --------------------- | ----------------------- |
| `username`      | string | ✅       | Tên đăng nhập         | `john_doe`              |
| `accountNumber` | string | ✅       | Số tài khoản          | `1234567890123456`      |
| `period`        | string | ✅       | Loại khoảng thời gian | `week`, `month`, `year` |

**Breakdown Logic:**

- **Week**: Chia theo 7 ngày (Thứ 2 → Chủ nhật)
- **Month**: Chia theo tuần (4-5 tuần)
- **Year**: Chia theo tháng (12 tháng)

**Response:**

```json
{
  "success": true,
  "data": {
    "labels": ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    "incomingData": [500000, 800000, 1200000, 600000, 900000, 1500000, 300000],
    "outgoingData": [300000, 600000, 800000, 400000, 700000, 1000000, 200000]
  },
  "message": "Trend data retrieved successfully"
}
```

**Response cho Month:**

```json
{
  "success": true,
  "data": {
    "labels": ["1/12", "8/12", "15/12", "22/12", "29/12"],
    "incomingData": [2500000, 3200000, 2800000, 3500000, 2900000],
    "outgoingData": [1800000, 2400000, 2100000, 2700000, 2200000]
  },
  "message": "Trend data retrieved successfully"
}
```

**Response cho Year:**

```json
{
  "success": true,
  "data": {
    "labels": [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12"
    ],
    "incomingData": [
      15000000, 18000000, 16000000, 19000000, 17000000, 20000000, 18500000,
      19500000, 21000000, 17500000, 18000000, 22000000
    ],
    "outgoingData": [
      12000000, 14000000, 13000000, 15000000, 13500000, 16000000, 14500000,
      15500000, 17000000, 14000000, 14500000, 18000000
    ]
  },
  "message": "Trend data retrieved successfully"
}
```

---

### 2.4 Lấy danh sách giao dịch theo khoảng thời gian

**Endpoint:** `GET /api/statistics/transactions`

**Mô tả:** Lấy danh sách chi tiết các giao dịch trong khoảng thời gian

**Query Parameters:**

| Parameter       | Type   | Required | Description           | Example                 |
| --------------- | ------ | -------- | --------------------- | ----------------------- |
| `username`      | string | ✅       | Tên đăng nhập         | `john_doe`              |
| `accountNumber` | string | ✅       | Số tài khoản          | `1234567890123456`      |
| `period`        | string | ✅       | Loại khoảng thời gian | `week`, `month`, `year` |
| `offset`        | number | ❌       | Lùi về kỳ trước       | `0`, `1`, `2`           |
| `page`          | number | ❌       | Trang (pagination)    | `1`                     |
| `limit`         | number | ❌       | Số lượng mỗi trang    | `20`                    |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "transactionId": 1001,
      "senderAccountNumber": "1234567890123456",
      "receiverAccountNumber": "2345678901234567",
      "amount": 500000,
      "currency": "VND",
      "transactionType": "SEND",
      "description": "Chuyển tiền ăn trưa",
      "status": "SUCCESS",
      "transactionAt": "2025-12-15T10:30:00Z",
      "balance": 9500000
    }
    // ... more transactions
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20
  },
  "message": "Transactions retrieved successfully"
}
```

---

## 3. Business Logic Requirements

### 3.1 Tính toán khoảng thời gian

**Week (Tuần):**

- Bắt đầu từ **Thứ 2** (Monday)
- Kết thúc vào **Chủ nhật** (Sunday)
- Ví dụ: Nếu hôm nay là Thứ 5 (15/12/2025), tuần hiện tại là 09/12 - 15/12

**Month (Tháng):**

- Từ ngày 1 đến ngày cuối cùng của tháng
- Ví dụ: Tháng 12/2025 là 01/12/2025 - 31/12/2025

**Year (Năm):**

- Từ 01/01 đến 31/12
- Ví dụ: Năm 2025 là 01/01/2025 - 31/12/2025

### 3.2 Xác định giao dịch vào/ra

```
Giao dịch VÀO (Incoming):
  - receiverAccountNumber === currentAccountNumber
  - transactionType === "RECEIVE"

Giao dịch RA (Outgoing):
  - senderAccountNumber === currentAccountNumber
  - transactionType === "SEND"
```

### 3.3 Tính toán người nhận thường xuyên nhất

- Chỉ tính cho **giao dịch RA** (outgoing)
- Nhóm theo `receiverAccountNumber`
- Sắp xếp theo số lần giao dịch (count) giảm dần
- Trả về người nhận có count cao nhất

### 3.4 Tính phần trăm thay đổi

```
percentageChange = ((current - previous) / previous) * 100

Đặc biệt:
- Nếu previous = 0 và current > 0: return 100
- Nếu previous = 0 và current = 0: return 0
```

---

## 4. Performance Considerations

> [!TIP] > **Optimization Tips cho Backend:**

### 4.1 Database Indexing

Cần tạo index cho các trường sau để tăng tốc query:

```sql
CREATE INDEX idx_transaction_account_date
ON transactions(senderAccountNumber, receiverAccountNumber, transactionAt);

CREATE INDEX idx_transaction_date
ON transactions(transactionAt);

CREATE INDEX idx_transaction_status
ON transactions(status);
```

### 4.2 Caching Strategy

- Cache thống kê cho các kỳ đã kết thúc (ví dụ: tháng trước, năm trước)
- Thời gian cache: 24 giờ cho kỳ đã kết thúc, 5 phút cho kỳ hiện tại
- Key format: `stats:{username}:{accountNumber}:{period}:{offset}`

### 4.3 Query Optimization

```sql
-- Ví dụ query tối ưu cho thống kê tuần
SELECT
  COUNT(*) as totalTransactions,
  SUM(CASE WHEN receiverAccountNumber = ? THEN amount ELSE 0 END) as totalIncoming,
  SUM(CASE WHEN senderAccountNumber = ? THEN amount ELSE 0 END) as totalOutgoing,
  AVG(amount) as averageTransaction
FROM transactions
WHERE
  (senderAccountNumber = ? OR receiverAccountNumber = ?)
  AND transactionAt BETWEEN ? AND ?
  AND status = 'SUCCESS';
```

---

## 5. Error Handling

### 5.1 Error Codes

| Code                 | Message                  | Description                   |
| -------------------- | ------------------------ | ----------------------------- |
| `INVALID_PERIOD`     | Invalid period parameter | Period không hợp lệ           |
| `INVALID_DATE_RANGE` | Invalid date range       | Khoảng thời gian không hợp lệ |
| `ACCOUNT_NOT_FOUND`  | Account not found        | Không tìm thấy tài khoản      |
| `UNAUTHORIZED`       | Unauthorized access      | Không có quyền truy cập       |
| `NO_DATA`            | No data available        | Không có dữ liệu              |

### 5.2 Error Response Format

```json
{
  "success": false,
  "error": "INVALID_PERIOD",
  "message": "Period must be one of: week, month, year",
  "details": {
    "providedValue": "daily",
    "allowedValues": ["week", "month", "year"]
  }
}
```

---

## 6. Testing Data

### 6.1 Mock Data Requirements

Để test đầy đủ, cần có:

- **Tuần hiện tại**: 15-20 giao dịch
- **Tuần trước**: 10-15 giao dịch
- **Tháng hiện tại**: 30-50 giao dịch
- **Tháng trước**: 25-40 giao dịch
- **Năm hiện tại**: 100-200 giao dịch
- **Năm trước**: 80-150 giao dịch

### 6.2 Test Cases

1. **Empty Data**: Người dùng mới, chưa có giao dịch
2. **Only Incoming**: Chỉ có giao dịch vào
3. **Only Outgoing**: Chỉ có giao dịch ra
4. **Mixed Transactions**: Có cả vào và ra
5. **Large Amounts**: Giao dịch với số tiền lớn (> 100 triệu)
6. **Multiple Recipients**: Nhiều người nhận khác nhau
7. **Same Recipient**: Giao dịch nhiều lần với cùng người nhận

---

## 7. Frontend Integration

### 7.1 Hiện tại Frontend đang dùng Mock Data

File: `src/page/statistics/utils/mockData.ts`

```typescript
export const USE_MOCK_DATA = true;
```

### 7.2 Khi Backend sẵn sàng

1. Tạo service layer: `src/services/StatisticsService.ts`
2. Implement các API calls
3. Đổi `USE_MOCK_DATA = false`
4. Test kỹ với real data

### 7.3 Service Interface Suggestion

```typescript
// src/services/StatisticsService.ts
export class StatisticsService {
  static async getPeriodStats(
    username: string,
    accountNumber: string,
    period: TimePeriod,
    offset: number = 0,
  ): Promise<PeriodStats> {
    // Call API /api/statistics/period
  }

  static async getComparison(
    username: string,
    accountNumber: string,
    period: TimePeriod,
  ): Promise<ComparisonData> {
    // Call API /api/statistics/comparison
  }

  static async getTrendData(
    username: string,
    accountNumber: string,
    period: TimePeriod,
  ): Promise<TrendData> {
    // Call API /api/statistics/trend
  }

  static async getTransactions(
    username: string,
    accountNumber: string,
    period: TimePeriod,
    offset: number = 0,
    page: number = 1,
    limit: number = 20,
  ): Promise<TransferResponse[]> {
    // Call API /api/statistics/transactions
  }
}
```

---

## 8. Security Considerations

> [!CAUTION] > **Bảo mật quan trọng:**

1. **Authentication**: Tất cả endpoints phải yêu cầu JWT token
2. **Authorization**: Chỉ cho phép user xem thống kê của chính mình
3. **Rate Limiting**: Giới hạn 100 requests/phút/user
4. **Data Validation**: Validate tất cả input parameters
5. **SQL Injection**: Sử dụng prepared statements
6. **Sensitive Data**: Không trả về thông tin nhạy cảm (PIN, password, etc.)

---

## 9. API Versioning

Base URL: `https://api.ebanking.com/v1`

Ví dụ full endpoint:

```
GET https://api.ebanking.com/v1/statistics/period?username=john_doe&accountNumber=1234567890123456&period=week
```

---

## 10. Contact & Support

Nếu có thắc mắc về spec này, vui lòng liên hệ:

- **Frontend Team Lead**: [Tên]
- **Backend Team Lead**: [Tên]
- **Project Manager**: [Tên]

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-15  
**Author**: Frontend Team
