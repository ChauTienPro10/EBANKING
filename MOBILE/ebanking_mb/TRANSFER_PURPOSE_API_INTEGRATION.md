# Transfer Purpose API Integration Guide

## Overview
Tài liệu này mô tả cách tích hợp API để quản lý mục đích giao dịch chuyển tiền. Hệ thống sử dụng prefix code trong nội dung giao dịch thay vì thêm field riêng biệt.

**⚠️ Lưu ý quan trọng:** Mobile app đã được tích hợp với fallback data, vì vậy tính năng sẽ hoạt động ngay cả khi API chưa được implement. Khi API sẵn sàng, app sẽ tự động chuyển sang sử dụng dữ liệu từ server.

## Fallback Data
Khi API chưa sẵn sàng (trả về 403, 404, 500 hoặc network error), app sẽ sử dụng dữ liệu mẫu:

```javascript
const FALLBACK_PURPOSES = [
  { id: '1', name: 'Đi chợ', code: 'MARKET', icon: '🛒' },
  { id: '2', name: 'Mua sắm', code: 'SHOPPING', icon: '🛍️' },
  { id: '3', name: 'Hóa đơn', code: 'BILL', icon: '📄' },
  { id: '4', name: 'Học phí', code: 'TUITION', icon: '🎓' },
  { id: '5', name: 'Ăn uống', code: 'FOOD', icon: '🍽️' },
  { id: '6', name: 'Khác', code: 'OTHER', icon: '📝' }
];
```

## API Endpoints

### 1. Get Transfer Purposes
Lấy danh sách các mục đích giao dịch có sẵn.

**Endpoint:** `GET /authService/transfer/purposes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (nếu cần)
```

**Response:**
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
    },
    {
      "id": "3",
      "name": "Hóa đơn",
      "code": "BILL",
      "icon": "📄"
    },
    {
      "id": "4",
      "name": "Học phí",
      "code": "TUITION",
      "icon": "🎓"
    },
    {
      "id": "5",
      "name": "Ăn uống",
      "code": "FOOD",
      "icon": "🍽️"
    },
    {
      "id": "6",
      "name": "Khác",
      "code": "OTHER",
      "icon": "📝"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Unable to fetch transfer purposes"
}
```

## Database Schema

### Transfer Purposes Table
```sql
CREATE TABLE transfer_purposes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Sample Data
```sql
INSERT INTO transfer_purposes (id, name, code, icon) VALUES
('1', 'Đi chợ', 'MARKET', '🛒'),
('2', 'Mua sắm', 'SHOPPING', '🛍️'),
('3', 'Hóa đơn', 'BILL', '📄'),
('4', 'Học phí', 'TUITION', '🎓'),
('5', 'Ăn uống', 'FOOD', '🍽️'),
('6', 'Khác', 'OTHER', '📝');
```

## Content Processing Logic

### Client Side (Mobile App)
Khi người dùng chọn mục đích giao dịch, app sẽ:

1. **Gửi request với content có prefix:**
```javascript
// Ví dụ: User chọn "Đi chợ" và nhập nội dung "Mua rau củ"
const finalContent = `[MARKET] Mua rau củ`;

// Payload gửi lên server
{
  "description": "[MARKET] Mua rau củ",
  // ... other fields
}
```

### Server Side Processing
Backend cần xử lý để tách prefix và content:

```javascript
// Hàm parse content từ client
function parseTransferContent(description) {
  const match = description.match(/^\[([^\]]+)\]\s*(.*)$/);
  
  if (match) {
    return {
      purposeCode: match[1],        // "MARKET"
      content: match[2] || '',      // "Mua rau củ"
      hasPurpose: true
    };
  }
  
  return {
    purposeCode: null,
    content: description,
    hasPurpose: false
  };
}

// Sử dụng trong transfer endpoint
app.post('/transaction/transfer', (req, res) => {
  const { description } = req.body;
  const parsed = parseTransferContent(description);
  
  // Lưu vào database
  const transaction = {
    ...req.body,
    description: parsed.content,           // Nội dung gốc
    purpose_code: parsed.purposeCode,      // Mã mục đích (có thể null)
    // ... other fields
  };
  
  // Process transaction...
});
```

## Database Schema for Transactions

### Updated Transaction Table
```sql
ALTER TABLE transactions 
ADD COLUMN purpose_code VARCHAR(20),
ADD FOREIGN KEY (purpose_code) REFERENCES transfer_purposes(code);
```

## API Implementation Example (Node.js/Express)

### Get Transfer Purposes
```javascript
app.get('/authService/transfer/purposes', async (req, res) => {
  try {
    const purposes = await db.query(`
      SELECT id, name, code, icon 
      FROM transfer_purposes 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    res.json({
      success: true,
      purposes: purposes
    });
  } catch (error) {
    console.error('Error fetching transfer purposes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to fetch transfer purposes'
    });
  }
});
```

### Updated Transfer Endpoint
```javascript
app.post('/transaction/transfer', async (req, res) => {
  try {
    const { description, ...otherFields } = req.body;
    
    // Parse purpose from description
    const parsed = parseTransferContent(description);
    
    // Validate purpose code if exists
    if (parsed.hasPurpose) {
      const purposeExists = await db.query(
        'SELECT id FROM transfer_purposes WHERE code = ? AND is_active = true',
        [parsed.purposeCode]
      );
      
      if (!purposeExists.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid purpose code'
        });
      }
    }
    
    // Create transaction
    const transaction = await db.query(`
      INSERT INTO transactions (
        description, purpose_code, sender_account, receiver_account, 
        amount, currency, transaction_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      parsed.content,
      parsed.purposeCode,
      otherFields.senderAccountNumber,
      otherFields.receiverAccountNumber,
      otherFields.amount,
      otherFields.currency,
      otherFields.transactionType
    ]);
    
    res.json({
      success: true,
      transactionId: transaction.insertId,
      message: 'Transfer completed successfully'
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Transfer failed',
      message: error.message
    });
  }
});
```

## Testing với Fallback Data

### Kiểm tra Mobile App
1. **Mở TransferScreen** - Sẽ thấy PurposeSelector
2. **Tap vào "Chọn mục đích giao dịch"** - Modal hiển thị 6 options
3. **Chọn một mục đích** - Hiển thị tên đã chọn
4. **Thực hiện transfer** - Content sẽ có prefix `[CODE] nội dung`

### Test Cases
```javascript
// Test content với purpose
const testCases = [
  {
    purpose: { code: 'MARKET', name: 'Đi chợ' },
    content: 'Mua rau củ',
    expected: '[MARKET] Mua rau củ'
  },
  {
    purpose: { code: 'BILL', name: 'Hóa đơn' },
    content: 'Thanh toán điện',
    expected: '[BILL] Thanh toán điện'
  },
  {
    purpose: null,
    content: 'Chuyển tiền thường',
    expected: 'Chuyển tiền thường'
  }
];
```

## Deployment Strategy

### Phase 1: Mobile App (Đã hoàn thành)
- ✅ UI components cho purpose selection
- ✅ Fallback data integration
- ✅ Content prefix logic
- ✅ Backward compatibility

### Phase 2: Backend API (Cần implement)
- 🔄 Create transfer_purposes table
- 🔄 Implement GET /transfer/purposes endpoint
- 🔄 Update transfer endpoint để parse prefix
- 🔄 Add purpose_code column to transactions

### Phase 3: Analytics & Reporting
- 📊 Purpose-based spending analytics
- 📊 User behavior insights
- 📊 Popular purposes tracking

## Monitoring & Maintenance

### Key Metrics to Monitor
- Purpose selection frequency
- API response times for /transfer/purposes
- Error rates in content parsing
- User adoption of purpose feature

### Regular Maintenance
- Review and update purpose list based on user feedback
- Clean up unused purpose codes
- Optimize database queries for analytics
- Update translations for new purposes

## Conclusion

Hệ thống này cho phép:
- ✅ Tính năng hoạt động ngay với fallback data
- ✅ Không thay đổi cấu trúc API transfer hiện tại
- ✅ Thêm tính năng mục đích giao dịch một cách linh hoạt
- ✅ Hỗ trợ phân tích chi tiêu theo mục đích
- ✅ Tương thích ngược với hệ thống cũ
- ✅ Dễ dàng mở rộng thêm mục đích mới

**Mobile app đã sẵn sàng sử dụng ngay bây giờ với fallback data. Backend có thể implement API sau mà không ảnh hưởng đến trải nghiệm người dùng.**