# Cập nhật: Xác thực bằng mật khẩu thay vì OTP

## 🔄 Thay đổi

Hệ thống đã được cập nhật để sử dụng **xác thực mật khẩu** thay vì OTP/SMS khi tự mở khóa tài khoản.

## ✅ Lý do thay đổi

1. **Đơn giản hơn**: User không cần chờ nhận OTP qua SMS/Email
2. **Nhanh hơn**: Mở khóa ngay lập tức bằng mật khẩu
3. **An toàn**: Mật khẩu đã được mã hóa và xác thực qua AuthService
4. **Tiết kiệm chi phí**: Không cần gửi SMS

## 📝 API đã thay đổi

### Trước đây (OTP):
```json
POST /lock-account/self-unlock
{
  "username": "user123",
  "verificationCode": "123456",  // ❌ OTP
  "notes": "Mở khóa"
}
```

### Bây giờ (Password):
```json
POST /lock-account/self-unlock
{
  "username": "user123",
  "password": "mySecurePassword",  // ✅ Mật khẩu
  "notes": "Mở khóa"
}
```

## 🔐 Cách hoạt động

### 1. User tự khóa tài khoản
```bash
curl -X POST http://localhost:8080/lock-account/self-lock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "user123",
    "reason": "Nghi ngờ bị xâm nhập"
  }'
```

### 2. User tự mở khóa bằng mật khẩu
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "mySecurePassword",
    "notes": "Đã xác minh an toàn"
  }'
```

**Xác thực:**
- Hệ thống gọi `AuthService.verifyPassword(username, password)`
- So sánh mật khẩu với mật khẩu đã mã hóa trong database
- Chỉ mở khóa nếu mật khẩu đúng

## ⚠️ Lưu ý bảo mật

### 1. **Rate Limiting** (Cần triển khai)
Giới hạn số lần thử mật khẩu sai:
```java
// TODO: Thêm rate limiting
@RateLimiter(name = "selfUnlock", fallbackMethod = "rateLimitFallback")
@PostMapping("/self-unlock")
public ResponseEntity<?> selfUnlockAccount(...) {
    // ...
}
```

**Khuyến nghị:**
- Tối đa 5 lần thử sai / 15 phút
- Khóa tạm thời sau 3 lần thử sai liên tiếp

### 2. **Logging**
Log mọi lần thử mở khóa:
```java
// TODO: Thêm audit log
auditLogService.log(
    "SELF_UNLOCK_ATTEMPT",
    username,
    isPasswordValid ? "SUCCESS" : "FAILED",
    request.getRemoteAddr()
);
```

### 3. **Notification**
Gửi thông báo khi có người thử mở khóa:
```java
// TODO: Gửi email/SMS
if (!isPasswordValid) {
    notificationService.sendAlert(username,
        "Có người đã thử mở khóa tài khoản của bạn với mật khẩu sai");
}
```

## 🧪 Test Cases

### Test 1: Mở khóa với mật khẩu đúng ✅
```bash
curl -X POST /lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "correctPassword"
  }'
```

**Expected:** HTTP 200 OK
```json
{
  "username": "user123",
  "lockType": "SELF_LOCK",
  "isActive": false,
  "message": "Bạn đã tự mở khóa tài khoản thành công"
}
```

### Test 2: Mở khóa với mật khẩu sai ❌
```bash
curl -X POST /lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "wrongPassword"
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Mật khẩu không đúng"
}
```

### Test 3: Mở khóa ADMIN_LOCK ❌
```bash
curl -X POST /lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "password": "correctPassword"
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để mở khóa."
}
```

### Test 4: Mật khẩu null/empty ❌
```bash
curl -X POST /lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": ""
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Vui lòng cung cấp mật khẩu"
}
```

## 📊 So sánh OTP vs Password

| Tiêu chí | OTP | Password |
|----------|-----|----------|
| Tốc độ | ⏱️ Chậm (chờ SMS) | ⚡ Nhanh (ngay lập tức) |
| Chi phí | 💰 Có (SMS) | ✅ Miễn phí |
| Bảo mật | 🔒 Cao (2FA) | 🔐 Trung bình |
| UX | 😐 Phức tạp | 😊 Đơn giản |
| Phụ thuộc | 📱 Cần điện thoại | ✅ Chỉ cần nhớ mật khẩu |

## 🎯 Kết luận

Việc chuyển sang xác thực mật khẩu:
- ✅ Đơn giản hóa quy trình
- ✅ Tiết kiệm chi phí
- ✅ Cải thiện trải nghiệm người dùng
- ⚠️ Cần thêm rate limiting để bảo mật

## 📝 Checklist triển khai

- [x] Cập nhật DTO (SelfUnlockAccountRequest)
- [x] Cập nhật Service (LockAccountService)
- [x] Cập nhật Controller (LockAccountController)
- [x] Tích hợp AuthService.verifyPassword()
- [ ] Thêm rate limiting
- [ ] Thêm audit logging
- [ ] Thêm notification
- [ ] Test trên staging
- [ ] Cập nhật tài liệu API
