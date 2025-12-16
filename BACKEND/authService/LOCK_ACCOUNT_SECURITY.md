# Bảo mật hệ thống Lock Account

## 🔒 Tổng quan bảo mật

Hệ thống đã được cập nhật với các biện pháp bảo mật để đảm bảo user chỉ có thể khóa/mở tài khoản của chính họ.

## ✅ Các biện pháp bảo mật đã triển khai

### 1. **Tự khóa tài khoản (POST /self-lock)**

#### Bảo mật:
- ✅ **Kiểm tra JWT Token**: Sử dụng `SecurityUtils.checkUser()` để xác thực
- ✅ **So sánh username**: Username trong request phải khớp với username trong JWT token
- ✅ **HTTP 403 Forbidden**: Trả về lỗi nếu user cố gắng khóa tài khoản của người khác

#### Code:
```java
@PostMapping("/self-lock")
public ResponseEntity<?> selfLockAccount(
        @RequestBody SelfLockAccountRequest request,
        @RequestHeader Map<String, String> headers) {
    
    // Kiểm tra quyền: User chỉ có thể khóa tài khoản của chính họ
    if (!securityUtils.checkUser(headers, request.getUsername())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Bạn không có quyền khóa tài khoản này"));
    }
    
    // Tiếp tục xử lý...
}
```

#### Ví dụ request:
```bash
curl -X POST http://localhost:8080/lock-account/self-lock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "username": "user123",
    "reason": "Nghi ngờ bị xâm nhập"
  }'
```

**Kết quả:**
- ✅ Nếu token của `user123`: Khóa thành công
- ❌ Nếu token của `user456`: HTTP 403 - "Bạn không có quyền khóa tài khoản này"

---

### 2. **Tự mở khóa tài khoản (POST /self-unlock)**

#### Bảo mật:
- ✅ **Không yêu cầu JWT Token**: Vì tài khoản đã bị khóa, user không thể đăng nhập để lấy token
- ✅ **Xác thực OTP/SMS**: Bảo mật được đảm bảo bằng mã xác thực
- ✅ **Kiểm tra lockType**: Chỉ cho phép mở khóa nếu là `SELF_LOCK`
- ✅ **Rate Limiting** (cần triển khai): Giới hạn số lần thử OTP sai

#### Code:
```java
@PostMapping("/self-unlock")
public ResponseEntity<?> selfUnlockAccount(
        @RequestBody SelfUnlockAccountRequest request) {
    
    // Không kiểm tra JWT token vì tài khoản đã bị khóa
    // Bảo mật được đảm bảo bằng mã xác thực OTP/SMS
    
    LockAccountResponse response = lockAccountService.selfUnlockAccount(
            request.getUsername(),
            request.getVerificationCode(),
            request.getNotes());
    
    return ResponseEntity.ok(response);
}
```

#### Trong Service:
```java
public LockAccountResponse selfUnlockAccount(String username, String verificationCode, String notes) {
    // Kiểm tra lockType
    if (!"SELF_LOCK".equals(lockAccount.getLockType())) {
        throw new IllegalStateException(
            "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để mở khóa.");
    }
    
    // Xác thực OTP (TODO: tích hợp hệ thống OTP thực tế)
    if (!otpService.verifyOTP(username, verificationCode)) {
        throw new IllegalArgumentException("Mã xác thực không đúng");
    }
    
    // Mở khóa...
}
```

---

### 3. **Khóa bởi Admin (POST /lock)**

#### Bảo mật:
- ⚠️ **Cần thêm kiểm tra role Admin**: Hiện tại chưa có
- 📝 **TODO**: Thêm annotation `@PreAuthorize("hasRole('ADMIN')")`

#### Code cần cập nhật:
```java
@PostMapping("/lock")
@PreAuthorize("hasRole('ADMIN')") // TODO: Thêm dòng này
public ResponseEntity<?> lockAccount(@RequestBody LockAccountRequest request) {
    // Chỉ admin mới được phép khóa tài khoản
}
```

---

### 4. **Mở khóa bởi Admin (POST /unlock)**

#### Bảo mật:
- ⚠️ **Cần thêm kiểm tra role Admin**: Hiện tại chưa có
- 📝 **TODO**: Thêm annotation `@PreAuthorize("hasRole('ADMIN')")`

---

## 🔐 Luồng bảo mật

### Luồng tự khóa:
```
1. User đăng nhập → Nhận JWT token
   ↓
2. Gọi POST /self-lock với token trong header
   ↓
3. Server kiểm tra: username trong token == username trong request?
   ↓
4a. ✅ Khớp → Khóa tài khoản (lockType = SELF_LOCK)
4b. ❌ Không khớp → HTTP 403 Forbidden
```

### Luồng tự mở khóa:
```
1. User bị khóa (không có token hợp lệ)
   ↓
2. Yêu cầu gửi OTP qua SMS/Email
   ↓
3. Gọi POST /self-unlock với username + OTP
   ↓
4. Server kiểm tra:
   - lockType == SELF_LOCK? (nếu ADMIN_LOCK → từ chối)
   - OTP có đúng?
   ↓
5a. ✅ Hợp lệ → Mở khóa tài khoản
5b. ❌ Không hợp lệ → HTTP 400 Bad Request
```

---

## ⚠️ Các điểm cần lưu ý

### 1. **Endpoint công khai**
Các endpoint sau có thể được gọi mà không cần token (public):
- `GET /can-self-unlock/{username}` - Kiểm tra quyền tự mở khóa
- `GET /lock-type/{username}` - Lấy loại khóa
- `POST /self-unlock` - Tự mở khóa (bảo mật bằng OTP)

**Lý do:** User đã bị khóa không thể đăng nhập để lấy token.

### 2. **Rate Limiting**
Cần triển khai rate limiting cho:
- `POST /self-unlock`: Giới hạn số lần thử OTP sai (ví dụ: 5 lần/15 phút)
- `GET /can-self-unlock`: Tránh brute force username

**Ví dụ với Spring:**
```java
@RateLimiter(name = "selfUnlock", fallbackMethod = "rateLimitFallback")
@PostMapping("/self-unlock")
public ResponseEntity<?> selfUnlockAccount(...) {
    // ...
}
```

### 3. **OTP Security**
Cần triển khai hệ thống OTP an toàn:
- ✅ OTP có thời gian hết hạn (5-10 phút)
- ✅ OTP chỉ sử dụng được 1 lần
- ✅ Gửi qua kênh an toàn (SMS, Email)
- ✅ Log mọi lần gửi và xác thực OTP

### 4. **Audit Log**
Nên log tất cả các hành động:
```java
@Autowired
private AuditLogService auditLogService;

public LockAccountResponse selfLockAccount(String username, String reason, String notes) {
    // Khóa tài khoản...
    
    auditLogService.log(
        "SELF_LOCK",
        username,
        "User tự khóa tài khoản: " + reason,
        request.getRemoteAddr()
    );
    
    return response;
}
```

---

## 🛡️ Checklist bảo mật

### Đã triển khai:
- ✅ Kiểm tra JWT token cho endpoint tự khóa
- ✅ So sánh username trong token vs request
- ✅ Kiểm tra lockType trước khi tự mở khóa
- ✅ Trả về HTTP status code phù hợp (403, 400)

### Cần triển khai:
- ⚠️ Xác thực OTP thực tế (hiện tại chỉ kiểm tra null)
- ⚠️ Rate limiting cho các endpoint nhạy cảm
- ⚠️ Kiểm tra role ADMIN cho endpoint admin
- ⚠️ Audit logging cho mọi hành động
- ⚠️ Email/SMS notification khi tài khoản bị khóa
- ⚠️ Captcha cho endpoint công khai

---

## 📝 Ví dụ tấn công và phòng thủ

### Tấn công 1: User A cố khóa tài khoản User B
```bash
# User A có token của mình
curl -X POST /lock-account/self-lock \
  -H "Authorization: Bearer <token_of_userA>" \
  -d '{"username": "userB", "reason": "..."}'
```

**Phòng thủ:**
```java
if (!securityUtils.checkUser(headers, request.getUsername())) {
    return HTTP 403 Forbidden;
}
```

### Tấn công 2: Brute force OTP
```bash
# Thử nhiều OTP
for i in {000000..999999}; do
  curl -X POST /lock-account/self-unlock \
    -d "{\"username\":\"victim\",\"verificationCode\":\"$i\"}"
done
```

**Phòng thủ:**
- Rate limiting: Chỉ cho phép 5 lần thử/15 phút
- OTP hết hạn sau 5 phút
- Khóa tạm thời sau 3 lần thử sai

### Tấn công 3: Enumeration username
```bash
# Kiểm tra username nào tồn tại
curl /lock-account/can-self-unlock/admin
curl /lock-account/can-self-unlock/user123
```

**Phòng thủ:**
- Trả về response giống nhau cho cả username tồn tại và không tồn tại
- Rate limiting
- Captcha sau nhiều request

---

## 🎯 Khuyến nghị

1. **Ngay lập tức:**
   - Triển khai xác thực OTP thực tế
   - Thêm rate limiting cho `/self-unlock`

2. **Ưu tiên cao:**
   - Thêm kiểm tra role ADMIN
   - Triển khai audit logging
   - Thêm email/SMS notification

3. **Ưu tiên trung bình:**
   - Thêm captcha cho endpoint công khai
   - Triển khai monitoring và alerting
   - Tạo dashboard quản lý tài khoản bị khóa

4. **Tương lai:**
   - Multi-factor authentication (MFA)
   - Biometric authentication
   - AI/ML phát hiện hành vi bất thường
