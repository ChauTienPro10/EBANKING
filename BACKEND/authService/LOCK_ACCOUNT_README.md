# Hệ thống quản lý khóa/mở tài khoản (Lock Account System)

## 📋 Tổng quan

Hệ thống này cung cấp chức năng quản lý khóa và mở khóa tài khoản người dùng trong ứng dụng ebanking. Khi một tài khoản bị khóa, hệ thống sẽ lưu lại thông tin chi tiết về việc khóa, bao gồm lý do, người thực hiện, và thời gian.

## 🏗️ Cấu trúc

### 1. Entity: `LockAccount`
Lưu trữ thông tin về các tài khoản bị khóa:
- `id`: ID duy nhất
- `username`: Tên đăng nhập bị khóa
- `userId`, `accountId`: ID liên quan (optional)
- `reason`: Lý do khóa
- `lockedAt`: Thời gian khóa
- `lockedBy`: Người thực hiện khóa
- `unlockedAt`: Thời gian mở khóa
- `unlockedBy`: Người thực hiện mở khóa
- `isActive`: Trạng thái (true = đang khóa, false = đã mở)
- `notes`: Ghi chú

### 2. Repository: `LockAccountRepository`
Các phương thức query:
- `findByUsernameAndIsActiveTrue()`: Tìm tài khoản đang bị khóa
- `existsByUsernameAndIsActiveTrue()`: Kiểm tra trạng thái khóa
- `findByIsActiveTrueOrderByLockedAtDesc()`: Lấy danh sách đang khóa
- `findByUsernameOrderByLockedAtDesc()`: Lịch sử khóa
- `countByIsActiveTrue()`: Đếm số lượng đang khóa

### 3. Service: `LockAccountService`
Logic nghiệp vụ:
- `lockAccount()`: Khóa tài khoản
- `unlockAccount()`: Mở khóa tài khoản
- `isAccountLocked()`: Kiểm tra trạng thái
- `getCurrentLockInfo()`: Lấy thông tin khóa hiện tại
- `getLockHistory()`: Lịch sử khóa
- `getAllLockedAccounts()`: Danh sách đang khóa
- `getLockedAccountsCount()`: Đếm số lượng

### 4. Controller: `LockAccountController`
REST API endpoints (base: `/lock-account`)

## 🔌 API Endpoints

### 1. Khóa tài khoản
```http
POST /lock-account/lock
Content-Type: application/json

{
  "username": "user123",
  "userId": 1,
  "accountId": 100,
  "reason": "Hoạt động đáng ngờ",
  "lockedBy": "admin",
  "notes": "Phát hiện giao dịch bất thường"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user123",
  "reason": "Hoạt động đáng ngờ",
  "lockedAt": "2025-12-16T20:00:00",
  "lockedBy": "admin",
  "isActive": true,
  "message": "Tài khoản đã được khóa thành công"
}
```

### 2. Mở khóa tài khoản
```http
POST /lock-account/unlock
Content-Type: application/json

{
  "username": "user123",
  "unlockedBy": "admin",
  "notes": "Đã xác minh, không có vấn đề"
}
```

### 3. Kiểm tra trạng thái khóa
```http
GET /lock-account/check/user123
```

**Response:**
```json
{
  "username": "user123",
  "isLocked": true,
  "lockInfo": {
    "id": 1,
    "reason": "Hoạt động đáng ngờ",
    "lockedAt": "2025-12-16T20:00:00",
    "lockedBy": "admin"
  }
}
```

### 4. Lấy thông tin khóa hiện tại
```http
GET /lock-account/current/user123
```

### 5. Lấy lịch sử khóa
```http
GET /lock-account/history/user123?page=0&size=10
```

**Response (có phân trang):**
```json
{
  "content": [...],
  "totalElements": 5,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

### 6. Lấy tất cả tài khoản đang bị khóa
```http
GET /lock-account/locked?page=0&size=10
```

### 7. Đếm số lượng tài khoản đang bị khóa
```http
GET /lock-account/count
```

**Response:**
```json
{
  "count": 15
}
```

### 8. Lấy tài khoản bị khóa bởi admin
```http
GET /lock-account/locked-by/admin
```

## 💡 Cách sử dụng

### Trong Service khác
```java
@Autowired
private LockAccountService lockAccountService;

// Kiểm tra trước khi cho phép giao dịch
if (lockAccountService.isAccountLocked(username)) {
    throw new AccountLockedException("Tài khoản đã bị khóa");
}

// Khóa tài khoản khi phát hiện bất thường
LockAccountRequest request = LockAccountRequest.builder()
    .username(username)
    .reason("Phát hiện 10 giao dịch lúc nửa đêm")
    .lockedBy("SYSTEM")
    .build();
lockAccountService.lockAccount(request);
```

### Tích hợp với Authentication
Bạn có thể thêm logic kiểm tra trong filter/interceptor:
```java
@Component
public class AccountLockFilter extends OncePerRequestFilter {
    @Autowired
    private LockAccountService lockAccountService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) {
        String username = getCurrentUsername(request);
        
        if (lockAccountService.isAccountLocked(username)) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("Tài khoản đã bị khóa");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## 🗄️ Database Schema

```sql
CREATE TABLE LOCK_ACCOUNT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    user_id BIGINT,
    account_id BIGINT,
    reason VARCHAR(500) NOT NULL,
    locked_at DATETIME NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    unlocked_at DATETIME,
    unlocked_by VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(1000),
    INDEX idx_username (username),
    INDEX idx_is_active (is_active),
    INDEX idx_locked_at (locked_at)
);
```

## ⚠️ Lưu ý

1. **Validation**: Luôn validate `reason` và `lockedBy` trước khi khóa
2. **Logging**: Nên log mọi thao tác khóa/mở để audit
3. **Notification**: Gửi thông báo cho user khi tài khoản bị khóa
4. **Auto-unlock**: Có thể thêm scheduled job để tự động mở khóa sau một khoảng thời gian
5. **Permissions**: Chỉ admin mới được phép khóa/mở tài khoản

## 🔄 Luồng xử lý

```
1. Phát hiện hoạt động bất thường
   ↓
2. Gọi lockAccount() với lý do cụ thể
   ↓
3. Hệ thống lưu bản ghi vào DB (isActive = true)
   ↓
4. User không thể đăng nhập/giao dịch
   ↓
5. Admin xem xét và quyết định
   ↓
6. Gọi unlockAccount() nếu xác minh OK
   ↓
7. Cập nhật bản ghi (isActive = false)
   ↓
8. User có thể hoạt động bình thường
```

## 🚀 Mở rộng

Có thể thêm các tính năng:
- Khóa tạm thời với thời gian hết hạn
- Khóa tự động dựa trên rule engine
- Dashboard quản lý tài khoản bị khóa
- Email/SMS thông báo khi bị khóa
- Khóa theo cấp độ (khóa giao dịch, khóa đăng nhập, v.v.)
