# Transfer Purpose Implementation Guide

## Tổng quan
Hệ thống API mục đích giao dịch đã được triển khai theo tài liệu `TRANSFER_PURPOSE_API_INTEGRATION.md`. Hệ thống này cho phép client lấy danh sách mục đích giao dịch và gửi giao dịch với prefix code mà không ảnh hưởng đến logic xử lý hiện tại.

## Các thành phần đã triển khai

### 1. Entity & Database
- **TransferPurpose.java**: Entity cho bảng transfer_purposes
- **transfer-purpose-schema.sql**: Script tạo bảng và dữ liệu mẫu
- **Transaction.java**: Đã thêm trường `purposeCode`

### 2. Repository & Service
- **TransferPurposeRepository.java**: Repository để truy vấn mục đích giao dịch
- **TransferPurposeService.java**: Service xử lý logic mục đích giao dịch
- **TransferContentParserService.java**: Service parse content từ client

### 3. Controller & API
- **TransferPurposeController.java** (transactionService): Controller cung cấp API `/authService/transfer/purposes`
- **TransferPurposeController.java** (authService): Proxy controller để client có thể gọi qua authService
- **TransferPurposeDto.java**: DTO cho response API

### 4. Integration
- **TransactionService.java**: Đã tích hợp xử lý purpose code trong transfer logic

## Cách sử dụng

### 1. Chạy Database Migration
```sql
-- Chạy script tạo bảng và dữ liệu
source transfer-purpose-schema.sql;
```

### 2. Test API
```bash
# Windows
test-transfer-purpose-api.bat

# Test via authService (port 8081) - RECOMMENDED
curl -X GET "http://localhost:8081/transfer/purposes" \
     -H "Content-Type: application/json"

# Test direct transactionService (port 8082)
curl -X GET "http://localhost:8082/authService/transfer/purposes" \
     -H "Content-Type: application/json"
```

### 3. Client Integration
Client có thể gọi API để lấy danh sách mục đích:

```javascript
// Get transfer purposes via authService (RECOMMENDED)
const response = await fetch('/transfer/purposes');
const data = await response.json();

if (data.success) {
    const purposes = data.purposes;
    // Display purposes to user
}
```

Khi gửi giao dịch với mục đích:
```javascript
// User chọn "Đi chợ" và nhập "Mua rau củ"
const finalDescription = "[MARKET] Mua rau củ";

// Gửi transfer request như bình thường
const transferRequest = {
    description: finalDescription,
    // ... other fields
};
```

## API Endpoints

### 1. Via AuthService (Recommended)
- **URL**: `GET /transfer/purposes`
- **Port**: 8081 (authService)
- **Description**: Proxy endpoint qua authService

### 2. Direct TransactionService
- **URL**: `GET /authService/transfer/purposes`  
- **Port**: 8082 (transactionService)
- **Description**: Direct endpoint từ transactionService

## Tính năng

### ✅ Đã hoàn thành
- API GET purposes trả về danh sách mục đích
- Parse content từ client với format `[CODE] content`
- Validate purpose code khi có prefix
- Lưu purpose_code riêng biệt trong database
- Tương thích ngược với giao dịch không có mục đích
- Không ảnh hưởng đến logic transfer hiện tại
- Proxy endpoint qua authService

### 🔄 Có thể mở rộng
- Analytics theo mục đích giao dịch
- Quản lý mục đích giao dịch (CRUD)
- Personalized purposes cho từng user
- Multi-language support

## Cấu trúc Database

### transfer_purposes
```sql
id VARCHAR(50) PRIMARY KEY
name VARCHAR(100) NOT NULL        -- Tên hiển thị
code VARCHAR(20) NOT NULL UNIQUE  -- Mã code (MARKET, SHOPPING, ...)
icon VARCHAR(10)                  -- Emoji icon
is_active BOOLEAN DEFAULT true    -- Trạng thái active
created_at TIMESTAMP
updated_at TIMESTAMP
```

### transaction (updated)
```sql
-- Thêm cột mới
purpose_code VARCHAR(20)  -- Foreign key to transfer_purposes.code
```

## API Response Format

### GET /transfer/purposes
```json
{
  "success": true,
  "purposes": [
    {
      "id": "1",
      "name": "Đi chợ",
      "code": "MARKET",
      "icon": "🛒"
    },
    {
      "id": "2",
      "name": "Mua sắm", 
      "code": "SHOPPING",
      "icon": "🛍️"
    }
  ]
}
```

## Content Processing

### Input từ Client
```
"[MARKET] Mua rau củ"
```

### Sau khi parse
- **purposeCode**: "MARKET"
- **description**: "Mua rau củ" (lưu vào database)
- **hasPurpose**: true

### Legacy Support
```
"Chuyển tiền không có mục đích"
```

- **purposeCode**: null
- **description**: "Chuyển tiền không có mục đích"
- **hasPurpose**: false

## Error Handling

### Invalid Purpose Code
```json
{
  "success": false,
  "error": "INVALID_PURPOSE_CODE",
  "message": "Mã mục đích giao dịch không hợp lệ"
}
```

### API Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Unable to fetch transfer purposes"
}
```

## Testing

### Test Cases
1. ✅ GET purposes API trả về danh sách đúng (via authService)
2. ✅ GET purposes API trả về danh sách đúng (direct transactionService)
3. ✅ Parse content với prefix hợp lệ
4. ✅ Parse content không có prefix (legacy)
5. ✅ Validate purpose code khi transfer
6. ✅ Transfer với purpose code hợp lệ
7. ✅ Transfer với purpose code không hợp lệ (error)

## Architecture

```
Client Request
     ↓
AuthService:8081 (/transfer/purposes)
     ↓ (proxy)
TransactionService:8082 (/authService/transfer/purposes)
     ↓
TransferPurposeService
     ↓
TransferPurposeRepository
     ↓
Database (transfer_purposes table)
```

## Monitoring

### Logs cần theo dõi
- Purpose code validation errors
- API response times
- Content parsing errors
- Database constraint violations
- Proxy request errors

### Metrics
- Purpose selection frequency
- API usage statistics
- Error rates by purpose code
- Proxy vs direct endpoint usage

## Maintenance

### Thêm mục đích mới
```sql
INSERT INTO transfer_purposes (id, name, code, icon) 
VALUES ('7', 'Du lịch', 'TRAVEL', '✈️');
```

### Vô hiệu hóa mục đích
```sql
UPDATE transfer_purposes 
SET is_active = false 
WHERE code = 'OLD_PURPOSE';
```

## Kết luận

Hệ thống đã được triển khai thành công với các đặc điểm:
- ✅ Không ảnh hưởng đến logic transfer hiện tại
- ✅ Tương thích ngược hoàn toàn
- ✅ API đơn giản cho client sử dụng
- ✅ Proxy endpoint qua authService
- ✅ Dễ dàng mở rộng và bảo trì
- ✅ Xử lý lỗi đầy đủ
- ✅ Logging và monitoring

**Client nên sử dụng endpoint `/transfer/purposes` qua authService (port 8081) để lấy danh sách mục đích và format content theo pattern `[CODE] description` khi gửi transfer request.**