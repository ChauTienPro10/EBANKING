# 📚 Transaction Request API - Quick Reference

## 🎯 Mục đích
API để quản lý và truy vấn danh sách transaction requests từ database với các tính năng:
- ✅ Phân trang
- ✅ Filter theo ngày, status, số tiền, reference number
- ✅ Sắp xếp theo nhiều tiêu chí
- ✅ Tìm kiếm nâng cao

## 🚀 Cách sử dụng nhanh

### 1. Import Postman Collection
- Import file: `Transaction_Request_API.postman_collection.json`
- Chạy request "Login" trước để lấy token
- Token sẽ tự động được lưu và sử dụng cho các request khác

### 2. Đọc tài liệu chi tiết
- **CLIENT_API_GUIDE.md** - Hướng dẫn đầy đủ cho client
- **TRANSACTION_REQUEST_API.md** - Tài liệu kỹ thuật chi tiết

### 3. Test với script
```bash
# Linux/Mac
chmod +x test-transaction-api.sh
./test-transaction-api.sh

# Windows
test-transaction-api.bat
```

## 📋 Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/admin/auth/login` | Đăng nhập lấy token |
| GET | `/api/transaction-requests` | Lấy danh sách (có filter + phân trang) |
| GET | `/api/transaction-requests/{id}` | Lấy chi tiết theo ID |

## 🔧 Parameters quan trọng

| Parameter | Ví dụ | Mô tả |
|-----------|-------|-------|
| `page` | 0 | Số trang (bắt đầu từ 0) |
| `size` | 20 | Số records mỗi trang |
| `fromDate` | 2024-12-01 | Từ ngày |
| `toDate` | 2024-12-31 | Đến ngày |
| `status` | COMPLETED | Trạng thái |
| `minAmount` | 100000 | Số tiền tối thiểu |
| `maxAmount` | 5000000 | Số tiền tối đa |
| `referenceNumber` | TXN2024 | Mã tham chiếu |

## 💡 Ví dụ nhanh

```bash
# 1. Login
curl -X POST "http://localhost:7999/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'

# 2. Lấy giao dịch hoàn thành trong tháng 12
curl -X GET "http://localhost:7999/api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&toDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Hỗ trợ
- **Port:** 7999
- **Database:** DB_TRANSACTION_SERVICE
- **Token expires:** 30 phút