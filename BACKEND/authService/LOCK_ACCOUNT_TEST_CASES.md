# Test Cases - Bảo mật Lock Account

## ✅ Test Case 1: User chỉ có thể tự khóa tài khoản của chính họ

### Setup:
- User A: username = "userA", token = `tokenA`
- User B: username = "userB", token = `tokenB`

### Test 1.1: User A khóa tài khoản của chính mình (PASS ✅)
```bash
curl -X POST http://localhost:8080/lock-account/self-lock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tokenA>" \
  -d '{
    "username": "userA",
    "reason": "Test tự khóa"
  }'
```

**Expected:** HTTP 200 OK
```json
{
  "username": "userA",
  "lockType": "SELF_LOCK",
  "isActive": true,
  "message": "Bạn đã tự khóa tài khoản thành công..."
}
```

### Test 1.2: User A cố khóa tài khoản của User B (FAIL ❌)
```bash
curl -X POST http://localhost:8080/lock-account/self-lock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tokenA>" \
  -d '{
    "username": "userB",
    "reason": "Hack attempt"
  }'
```

**Expected:** HTTP 403 Forbidden
```json
{
  "error": "Bạn không có quyền khóa tài khoản này"
}
```

### Test 1.3: Không có token (FAIL ❌)
```bash
curl -X POST http://localhost:8080/lock-account/self-lock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "reason": "Test"
  }'
```

**Expected:** HTTP 401 Unauthorized hoặc 403 Forbidden

---

## ✅ Test Case 2: Chỉ SELF_LOCK mới có thể tự mở khóa

### Setup:
- User A bị khóa bởi ADMIN (lockType = "ADMIN_LOCK")
- User B tự khóa (lockType = "SELF_LOCK")

### Test 2.1: User B tự mở khóa SELF_LOCK (PASS ✅)
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "verificationCode": "123456"
  }'
```

**Expected:** HTTP 200 OK
```json
{
  "username": "userB",
  "lockType": "SELF_LOCK",
  "isActive": false,
  "message": "Bạn đã tự mở khóa tài khoản thành công"
}
```

### Test 2.2: User A cố tự mở khóa ADMIN_LOCK (FAIL ❌)
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "verificationCode": "123456"
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để mở khóa."
}
```

---

## ✅ Test Case 3: Kiểm tra quyền với các endpoint GET

### Test 3.1: Kiểm tra can-self-unlock
```bash
# User với SELF_LOCK
curl http://localhost:8080/lock-account/can-self-unlock/userB
```

**Expected:** HTTP 200 OK
```json
{
  "username": "userB",
  "canSelfUnlock": true,
  "lockType": "SELF_LOCK"
}
```

```bash
# User với ADMIN_LOCK
curl http://localhost:8080/lock-account/can-self-unlock/userA
```

**Expected:** HTTP 200 OK
```json
{
  "username": "userA",
  "canSelfUnlock": false,
  "lockType": "ADMIN_LOCK",
  "message": "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ."
}
```

---

## ✅ Test Case 4: Xác thực OTP

### Test 4.1: OTP đúng (PASS ✅)
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "verificationCode": "123456"
  }'
```

**Expected:** HTTP 200 OK (mở khóa thành công)

### Test 4.2: OTP sai (FAIL ❌)
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "verificationCode": "wrong_otp"
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Mã xác thực không đúng hoặc đã hết hạn"
}
```

### Test 4.3: OTP null/empty (FAIL ❌)
```bash
curl -X POST http://localhost:8080/lock-account/self-unlock \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "verificationCode": ""
  }'
```

**Expected:** HTTP 400 Bad Request
```json
{
  "error": "Vui lòng cung cấp mã xác thực"
}
```

---

## 🔧 Script test tự động (Bash)

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/lock-account"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Tự khóa với token đúng
echo "Test 1: User tự khóa tài khoản của chính họ..."
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/self-lock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER_A" \
  -d '{"username":"userA","reason":"Test"}')

http_code="${response: -3}"
if [ "$http_code" == "200" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
fi

# Test 2: Cố khóa tài khoản người khác
echo "Test 2: User cố khóa tài khoản người khác..."
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/self-lock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER_A" \
  -d '{"username":"userB","reason":"Hack"}')

http_code="${response: -3}"
if [ "$http_code" == "403" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (Expected 403, got $http_code)${NC}"
fi

# Test 3: Tự mở khóa SELF_LOCK
echo "Test 3: Tự mở khóa SELF_LOCK..."
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/self-unlock" \
  -H "Content-Type: application/json" \
  -d '{"username":"userB","verificationCode":"123456"}')

http_code="${response: -3}"
if [ "$http_code" == "200" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
fi

# Test 4: Cố tự mở khóa ADMIN_LOCK
echo "Test 4: Cố tự mở khóa ADMIN_LOCK..."
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/self-unlock" \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","verificationCode":"123456"}')

http_code="${response: -3}"
if [ "$http_code" == "400" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (Expected 400, got $http_code)${NC}"
fi

echo "Done!"
```

---

## 📊 Kết quả mong đợi

| Test Case | Endpoint | Token | Username | Expected Result |
|-----------|----------|-------|----------|-----------------|
| 1.1 | POST /self-lock | userA | userA | ✅ 200 OK |
| 1.2 | POST /self-lock | userA | userB | ❌ 403 Forbidden |
| 1.3 | POST /self-lock | (none) | userA | ❌ 401/403 |
| 2.1 | POST /self-unlock | - | userB (SELF_LOCK) | ✅ 200 OK |
| 2.2 | POST /self-unlock | - | userA (ADMIN_LOCK) | ❌ 400 Bad Request |
| 4.1 | POST /self-unlock | - | userB + OTP đúng | ✅ 200 OK |
| 4.2 | POST /self-unlock | - | userB + OTP sai | ❌ 400 Bad Request |
| 4.3 | POST /self-unlock | - | userB + OTP null | ❌ 400 Bad Request |

---

## 🎯 Checklist trước khi deploy

- [ ] Tất cả test cases đều PASS
- [ ] Đã triển khai xác thực OTP thực tế
- [ ] Đã thêm rate limiting
- [ ] Đã test với Postman/Insomnia
- [ ] Đã review code bảo mật
- [ ] Đã thêm logging cho mọi hành động
- [ ] Đã test trên môi trường staging
