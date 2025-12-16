# Hướng dẫn tự khóa/mở tài khoản (Self Lock/Unlock)

## 📋 Tổng quan

Tính năng này cho phép người dùng tự khóa và mở khóa tài khoản của chính họ khi nghi ngờ tài khoản bị xâm nhập hoặc cần tạm thời vô hiệu hóa tài khoản.

## 🔐 Phân biệt loại khóa

Hệ thống hỗ trợ 2 loại khóa:

### 1. **ADMIN_LOCK** - Khóa bởi Admin/Hệ thống
- Được tạo bởi admin hoặc hệ thống tự động
- **KHÔNG THỂ** tự mở khóa
- Phải liên hệ admin để mở khóa

### 2. **SELF_LOCK** - Tự khóa
- Người dùng tự khóa tài khoản của mình
- **CÓ THỂ** tự mở khóa bằng mã xác thực (OTP/SMS)
- Không cần admin can thiệp

## 🚀 API Endpoints mới

### 1. Tự khóa tài khoản
```http
POST /lock-account/self-lock
Content-Type: application/json

{
  "username": "user123",
  "reason": "Nghi ngờ tài khoản bị xâm nhập",
  "notes": "Phát hiện đăng nhập từ địa chỉ lạ"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user123",
  "reason": "Nghi ngờ tài khoản bị xâm nhập",
  "lockType": "SELF_LOCK",
  "lockedAt": "2025-12-16T21:00:00",
  "lockedBy": "user123",
  "isActive": true,
  "message": "Bạn đã tự khóa tài khoản thành công. Vui lòng liên hệ hỗ trợ hoặc sử dụng mã xác thực để mở khóa."
}
```

### 2. Tự mở khóa tài khoản (cần OTP)
```http
POST /lock-account/self-unlock
Content-Type: application/json

{
  "username": "user123",
  "verificationCode": "123456",
  "notes": "Đã xác minh an toàn"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user123",
  "lockType": "SELF_LOCK",
  "unlockedAt": "2025-12-16T21:30:00",
  "unlockedBy": "user123",
  "isActive": false,
  "message": "Bạn đã tự mở khóa tài khoản thành công"
}
```

**Lỗi nếu là ADMIN_LOCK:**
```json
{
  "error": "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để mở khóa."
}
```

### 3. Kiểm tra quyền tự mở khóa
```http
GET /lock-account/can-self-unlock/user123
```

**Response:**
```json
{
  "username": "user123",
  "canSelfUnlock": true,
  "lockType": "SELF_LOCK"
}
```

hoặc

```json
{
  "username": "user123",
  "canSelfUnlock": false,
  "lockType": "ADMIN_LOCK",
  "message": "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ."
}
```

### 4. Lấy loại khóa
```http
GET /lock-account/lock-type/user123
```

**Response:**
```json
{
  "username": "user123",
  "lockType": "SELF_LOCK",
  "isLocked": true,
  "message": "Tài khoản tự khóa. Có thể tự mở khóa bằng mã xác thực."
}
```

## 💡 Luồng xử lý

### Luồng tự khóa:
```
1. User nghi ngờ tài khoản bị xâm nhập
   ↓
2. Gọi POST /lock-account/self-lock
   ↓
3. Hệ thống tạo bản ghi với lockType = "SELF_LOCK"
   ↓
4. User không thể đăng nhập/giao dịch
   ↓
5. User nhận SMS/Email hướng dẫn mở khóa
```

### Luồng tự mở khóa:
```
1. User muốn mở khóa tài khoản
   ↓
2. Kiểm tra GET /lock-account/can-self-unlock/{username}
   ↓
3. Nếu canSelfUnlock = true:
   - Yêu cầu gửi OTP qua SMS/Email
   - User nhập OTP
   - Gọi POST /lock-account/self-unlock với verificationCode
   ↓
4. Hệ thống xác thực OTP
   ↓
5. Mở khóa tài khoản (isActive = false)
   ↓
6. User có thể đăng nhập bình thường
```

## 🔧 Tích hợp trong code

### Frontend - Tự khóa tài khoản
```javascript
async function selfLockAccount(reason) {
  try {
    const response = await fetch('/lock-account/self-lock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: currentUser.username,
        reason: reason,
        notes: 'Khóa từ ứng dụng mobile'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      // Đăng xuất user
      logout();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Frontend - Tự mở khóa
```javascript
async function selfUnlockAccount(otp) {
  try {
    const response = await fetch('/lock-account/self-unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        verificationCode: otp,
        notes: 'Mở khóa từ ứng dụng'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      // Cho phép đăng nhập lại
      redirectToLogin();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Backend - Kiểm tra trước khi cho phép đăng nhập
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
            String lockType = lockAccountService.getLockType(username);
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Tài khoản đã bị khóa");
            error.put("lockType", lockType);
            
            if ("SELF_LOCK".equals(lockType)) {
                error.put("canSelfUnlock", true);
                error.put("message", "Bạn có thể tự mở khóa bằng mã xác thực");
            } else {
                error.put("canSelfUnlock", false);
                error.put("message", "Vui lòng liên hệ hỗ trợ");
            }
            
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");
            response.getWriter().write(new ObjectMapper().writeValueAsString(error));
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## ⚠️ Lưu ý quan trọng

### 1. Xác thực OTP
Hiện tại phương thức `selfUnlockAccount()` chỉ kiểm tra xem `verificationCode` có null không. Bạn cần tích hợp với hệ thống OTP thực tế:

```java
// TODO: Thêm vào LockAccountService
@Autowired
private OTPService otpService;

public LockAccountResponse selfUnlockAccount(String username, String verificationCode, String notes) {
    // ... code hiện tại ...
    
    // Xác thực OTP
    if (!otpService.verifyOTP(username, verificationCode)) {
        throw new IllegalArgumentException("Mã xác thực không đúng hoặc đã hết hạn");
    }
    
    // ... tiếp tục mở khóa ...
}
```

### 2. Lấy username từ JWT Token
Trong production, nên lấy username từ JWT token thay vì từ request body:

```java
@PostMapping("/self-lock")
public ResponseEntity<?> selfLockAccount(
        @RequestBody SelfLockAccountRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
    
    String username = userDetails.getUsername(); // Lấy từ token
    
    LockAccountResponse response = lockAccountService.selfLockAccount(
            username,
            request.getReason(),
            request.getNotes()
    );
    return ResponseEntity.ok(response);
}
```

### 3. Gửi thông báo
Nên gửi email/SMS khi tài khoản bị khóa:

```java
@Autowired
private NotificationService notificationService;

public LockAccountResponse selfLockAccount(String username, String reason, String notes) {
    // ... code khóa tài khoản ...
    
    // Gửi thông báo
    notificationService.sendSMS(username, 
        "Tài khoản của bạn đã bị khóa. Mã OTP để mở khóa: " + otpService.generateOTP(username));
    
    notificationService.sendEmail(username,
        "Tài khoản bị khóa",
        "Tài khoản của bạn đã được khóa. Vui lòng sử dụng mã OTP trong SMS để mở khóa.");
    
    return response;
}
```

## 🎯 Use Cases

### 1. User mất điện thoại
```
User: Tôi mất điện thoại, sợ bị truy cập tài khoản
→ Tự khóa tài khoản từ web/app khác
→ Sau khi tìm lại điện thoại, tự mở khóa bằng OTP
```

### 2. Phát hiện đăng nhập lạ
```
Hệ thống: Phát hiện đăng nhập từ IP lạ
→ Gửi thông báo cho user
→ User xác nhận không phải mình
→ User tự khóa tài khoản ngay lập tức
→ Liên hệ hỗ trợ để điều tra
```

### 3. Tạm thời không sử dụng
```
User: Đi du lịch, không muốn rủi ro
→ Tự khóa tài khoản trước khi đi
→ Về đến nơi, tự mở khóa bằng OTP
```

## 🔄 So sánh ADMIN_LOCK vs SELF_LOCK

| Tính năng | ADMIN_LOCK | SELF_LOCK |
|-----------|------------|-----------|
| Người khóa | Admin/Hệ thống | Chính user |
| Tự mở khóa | ❌ Không | ✅ Có (với OTP) |
| Lý do | Vi phạm, gian lận | Bảo mật cá nhân |
| Mức độ nghiêm trọng | Cao | Thấp-Trung bình |
| Cần admin can thiệp | ✅ Bắt buộc | ❌ Không |

## 📊 Database Schema Update

Cần thêm cột `lock_type` vào bảng `LOCK_ACCOUNT`:

```sql
ALTER TABLE LOCK_ACCOUNT 
ADD COLUMN lock_type VARCHAR(20) NOT NULL DEFAULT 'ADMIN_LOCK';

-- Tạo index cho hiệu suất
CREATE INDEX idx_lock_type ON LOCK_ACCOUNT(lock_type);
```

## 🎉 Kết luận

Tính năng tự khóa/mở tài khoản giúp:
- ✅ Tăng cường bảo mật cho người dùng
- ✅ Giảm tải cho đội ngũ hỗ trợ
- ✅ Người dùng chủ động bảo vệ tài khoản
- ✅ Phản ứng nhanh khi phát hiện bất thường
