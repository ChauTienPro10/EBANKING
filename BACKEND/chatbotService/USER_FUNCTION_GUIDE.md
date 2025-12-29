# Hướng dẫn User Function Calling với Gemini

## Tổng quan

Hệ thống đã được đơn giản hóa để chỉ tập trung vào **user-related functions**. Với userId, bạn có thể sử dụng để truy vấn các service khác trong hệ thống ebanking.

## Sử dụng Username Context

Hệ thống hỗ trợ username context, cho phép Gemini tự động sử dụng thông tin người dùng hiện tại khi họ hỏi về "tôi", "của tôi".

### Cách hoạt động:

1. **ChatController** nhận `QuestionRequest` với `username`
2. **GeminiService** sử dụng username làm context
3. Khi khách hàng hỏi về "thông tin của tôi" → tự động sử dụng username hiện tại
4. Khi khách hàng hỏi về user khác → sử dụng username được chỉ định

### Ví dụ:

**Request:**

```json
{
  "username": "john_doe",
  "text": "Thông tin của tôi",
  "time": 1640995200000
}
```

**Gemini sẽ tự động:**

- Nhận diện "của tôi" → sử dụng username "john_doe"
- Gọi function `getUserInfo` với username="john_doe"
- Trả về thông tin của john_doe

## Các Function được hỗ trợ

### 1. getUserInfo

**Mục đích**: Lấy thông tin chi tiết người dùng
**Tham số**:

- `username` (tùy chọn): Tên đăng nhập. Nếu không cung cấp, sử dụng username từ context

**Ví dụ câu hỏi kích hoạt**:

- "Thông tin của tôi" (sử dụng username từ context)
- "Thông tin tài khoản của user123" (chỉ định username cụ thể)
- "Hồ sơ cá nhân của tôi"
- "Trạng thái eKYC của tôi"

### 2. getUserId

**Mục đích**: Lấy ID người dùng từ username
**Tham số**:

- `username` (tùy chọn): Tên đăng nhập. Nếu không cung cấp, sử dụng username từ context

**Ví dụ câu hỏi kích hoạt**:

- "ID của tôi là gì?" (sử dụng username từ context)
- "ID của user123 là gì?" (chỉ định username cụ thể)
- "Mã người dùng của tôi"

### 3. getUserDetailsWithId

**Mục đích**: Lấy thông tin chi tiết bao gồm userId để các service khác sử dụng
**Tham số**:

- `username` (tùy chọn): Tên đăng nhập. Nếu không cung cấp, sử dụng username từ context

**Ví dụ câu hỏi kích hoạt**:

- "Thông tin chi tiết của tôi để truy vấn các service khác"
- "Lấy userId để kiểm tra tài khoản"

## Cấu hình

### Application Properties

```properties
# External Database Configuration - Kết nối DB_USER_SERVICE
external-dbs.names=userService
external-dbs.userService.url=jdbc:mysql://3.85.17.154:3306/DB_USER_SERVICE?useSSL=false&serverTimezone=UTC
external-dbs.userService.username=root
external-dbs.userService.password=root@123
external-dbs.userService.driver-class-name=com.mysql.cj.jdbc.Driver

# Hikari Connection Pool Settings
external-dbs.hikari.maximum-pool-size=5
external-dbs.hikari.connection-timeout=5000
```

## API Testing

### Chat với Username Context:

```bash
# Test chat với context
POST /chat/ask
{
  "username": "john_doe",
  "text": "Thông tin của tôi",
  "time": 1640995200000
}

# Test chat với username cụ thể
POST /api/chat-test/ask-as-user/john_doe
Content-Type: text/plain
"ID của tôi là gì?"
```

### Xem function schemas:

```bash
GET /api/functions/schemas
```

### Test từng function:

```bash
# Test thông tin user
POST /api/functions/test/user-info
{
  "username": "user123",
  "requestingUser": "john_doe"
}

# Test lấy userId
POST /api/functions/test/user-id
{
  "username": "admin",
  "requestingUser": "john_doe"
}

# Test thông tin chi tiết với userId
POST /api/functions/test/user-details
{
  "username": "user123",
  "requestingUser": "john_doe"
}
```

## Luồng hoạt động

1. **Người dùng hỏi**: "Thông tin của tôi"

2. **ChatController**: Nhận QuestionRequest với username="john_doe"

3. **GeminiService**: Gọi generate(prompt, "john_doe")

4. **Gemini phân tích**: Nhận diện cần gọi function `getUserInfo`

5. **Function Call**: Gemini gọi function không cần parameters (sử dụng context)

6. **BankingApiService**: Nhận call với username context:

   ```java
   getUserInfo("john_doe", "john_doe")
   ```

7. **UserService**: Truy vấn DB_USER_SERVICE để lấy thông tin

8. **Response**: Trả về thông tin user đã format

## Lợi ích của việc có userId

### 1. **Truy vấn các service khác**

Với userId, bạn có thể:

- Gọi Account Service để lấy danh sách tài khoản
- Gọi Transaction Service để lấy lịch sử giao dịch
- Gọi Loan Service để lấy thông tin khoản vay
- Gọi Card Service để lấy thông tin thẻ

### 2. **Ví dụ sử dụng userId**

```java
// Sau khi có userId từ getUserDetailsWithId
Long userId = 12345L;

// Có thể gọi các service khác:
// GET /account-service/api/accounts?userId=12345
// GET /transaction-service/api/transactions?userId=12345
// GET /loan-service/api/loans?userId=12345
```

### 3. **Tích hợp với hệ thống**

- **Single Source of Truth**: User info từ DB_USER_SERVICE
- **Microservice Architecture**: userId làm key để liên kết các service
- **Security**: Mỗi request đều có user context để audit
- **Scalability**: Dễ dàng mở rộng thêm service mới

## Mở rộng trong tương lai

Khi cần thêm function mới:

1. **Thêm function declaration** trong `FunctionSchemaConfig.java`
2. **Implement logic** trong `BankingApiService.java`
3. **Update switch case** trong `GeminiService.executeFunctionCall()`
4. **Thêm test endpoint** trong `FunctionTestController.java`

Ví dụ thêm function `getAccountsByUserId`:

```java
// Sử dụng userId để lấy danh sách tài khoản
public String getAccountsByUserId(Long userId, String requestingUser) {
    // Gọi Account Service với userId
    // Return formatted account list
}
```
