# Tính năng Tài khoản Tiết kiệm

## Tổng quan
Hệ thống đã được mở rộng để hỗ trợ tài khoản tiết kiệm với các tính năng:
- Mở tài khoản tiết kiệm (độc lập với tài khoản thanh toán)
- Chuyển tiền giữa tài khoản thanh toán và tài khoản tiết kiệm
- Xử lý yêu cầu nạp/rút tiền mặt từ tài khoản tiết kiệm
- Quản lý lãi suất theo kỳ hạn

## Cấu trúc Database

### Bảng `interest_rate`
- Lưu thông tin lãi suất theo kỳ hạn
- Hỗ trợ nhiều mức lãi suất cho các khoản tiền khác nhau
- Có thời gian hiệu lực

### Bảng `savings_account`
- Tài khoản tiết kiệm liên kết với tài khoản thanh toán
- Có kỳ hạn và ngày đáo hạn
- Theo dõi lãi suất đã tích lũy

### Bảng `transaction_request`
- Lưu các yêu cầu giao dịch tiền mặt
- Admin có thể duyệt/từ chối
- Trạng thái: PENDING, APPROVED, REJECTED, COMPLETED

## API Endpoints

### Tài khoản Tiết kiệm
- `POST /api/savings-accounts` - Tạo tài khoản tiết kiệm mới
- `GET /api/savings-accounts/user/{userId}` - Lấy danh sách tài khoản tiết kiệm của user
- `GET /api/savings-accounts/account/{accountNumber}` - Lấy thông tin tài khoản tiết kiệm

### Chuyển tiền
- `POST /api/savings-transfers/payment-to-savings` - Chuyển từ tài khoản thanh toán sang tiết kiệm
- `POST /api/savings-transfers/savings-to-payment` - Chuyển từ tài khoản tiết kiệm sang thanh toán

### Yêu cầu Giao dịch Tiền mặt
- `POST /api/transaction-requests/cash` - Tạo yêu cầu nạp/rút tiền mặt
- `GET /api/transaction-requests/user/{userId}` - Lấy danh sách yêu cầu của user
- `GET /api/transaction-requests/pending` - Lấy danh sách yêu cầu chờ duyệt (cho admin)
- `POST /api/transaction-requests/{requestId}/approve` - Duyệt yêu cầu
- `POST /api/transaction-requests/{requestId}/reject` - Từ chối yêu cầu

### Lãi suất
- `GET /api/interest-rates/active` - Lấy danh sách lãi suất đang áp dụng
- `GET /api/interest-rates/applicable?termMonths={term}&amount={amount}` - Tìm lãi suất phù hợp

## Cách sử dụng

### 1. Tạo tài khoản tiết kiệm
```json
POST /api/savings-accounts
{
    "userId": 1,
    "paymentAccountId": 1,
    "initialAmount": 10000000,
    "currency": "VND",
    "interestRateId": 3,
    "termMonths": 6
}
```

### 2. Chuyển tiền từ tài khoản thanh toán sang tiết kiệm
```json
POST /api/savings-transfers/payment-to-savings
{
    "userId": 1,
    "fromAccountNumber": "ACC123456789",
    "toAccountNumber": "SAV123456789",
    "amount": 5000000,
    "currency": "VND",
    "description": "Nạp thêm tiền tiết kiệm"
}
```

### 3. Tạo yêu cầu rút tiền mặt
```json
POST /api/transaction-requests/cash
{
    "userId": 1,
    "savingsAccountId": 1,
    "requestType": "CASH_WITHDRAWAL",
    "amount": 2000000,
    "currency": "VND",
    "description": "Rút tiền mặt khẩn cấp"
}
```

### 4. Admin duyệt yêu cầu
```
POST /api/transaction-requests/1/approve?adminUsername=admin1
```

## Lưu ý
- Tài khoản tiết kiệm có kỳ hạn, rút trước hạn có thể áp dụng phí phạt
- Yêu cầu tiền mặt cần admin duyệt trước khi thực hiện
- Lãi suất được tính theo năm và có thể thay đổi theo thời gian
- Hệ thống sử dụng REST API thông thường, không dùng gRPC cho tính năng này

## Cài đặt
1. Chạy script `database-schema.sql` để tạo bảng
2. Chạy script `sample-data.sql` để thêm dữ liệu mẫu lãi suất
3. Khởi động ứng dụng Spring Boot
4. Test các API endpoints