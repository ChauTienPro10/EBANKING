# Notification Management API Documentation

## Tổng quan
Module này cung cấp các API để quản lý thông báo trong hệ thống adminTool, giao tiếp với Firebase Service thông qua `HttpUltils`.

## Cấu hình

### 1. File application.yml
```yaml
firebase:
  service:
    url: ${FIREBASE_SERVICE_URL:http://localhost:8083/notify}
```

Mặc định Firebase Service chạy ở `http://localhost:8083/notify`. Bạn có thể thay đổi bằng cách set biến môi trường `FIREBASE_SERVICE_URL`.

### 2. RestTemplate Bean
Đảm bảo bạn đã có `RestTemplate` bean trong config:

```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## API Endpoints

### 1. Lưu FCM Token
**POST** `/api/notification/save-token`

**Request Body:**
```json
{
  "username": "user123",
  "deviceId": "device-abc-123",
  "token": "fcm-token-xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token saved successfully"
}
```

---

### 2. Cập nhật FCM Token
**POST** `/api/notification/update-token`

**Request Body:**
```json
{
  "username": "user123",
  "deviceId": "device-abc-123",
  "token": "new-fcm-token-xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token updated successfully"
}
```

---

### 3. Gửi thông báo cho tất cả người dùng
**POST** `/api/notification/push-all`

**Request Body:**
```json
{
  "title": "Thông báo hệ thống",
  "body": "Hệ thống sẽ bảo trì vào 22h tối nay"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to all users successfully"
}
```

---

### 4. Gửi thông báo cho người dùng cụ thể
**POST** `/api/notification/push-to-user`

**Request Body:**
```json
{
  "username": "user123",
  "title": "Thông báo cá nhân",
  "body": "Bạn có một giao dịch mới"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to user successfully"
}
```

---

### 5. Lấy danh sách thông báo hệ thống
**GET** `/api/notification/system?index=0&limit=10`

**Query Parameters:**
- `index` (optional, default: 0): Vị trí bắt đầu
- `limit` (optional, default: 10): Số lượng bản ghi

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Thông báo hệ thống",
      "content": "Nội dung thông báo",
      "type": "SYSTEM",
      "createdAt": "2025-12-18T20:00:00",
      "updatedAt": "2025-12-18T20:00:00"
    }
  ],
  "index": 0,
  "limit": 10,
  "count": 1
}
```

---

### 6. Lấy danh sách thông báo giao dịch
**GET** `/api/notification/transaction?index=0&limit=10`

**Query Parameters:**
- `index` (optional, default: 0): Vị trí bắt đầu
- `limit` (optional, default: 10): Số lượng bản ghi

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "user123",
      "transactionType": "TRANSFER",
      "amount": 1000000,
      "content": "Chuyển tiền thành công",
      "createdAt": "2025-12-18T20:00:00"
    }
  ],
  "index": 0,
  "limit": 10,
  "count": 1
}
```

---

### 7. Gửi thông báo đơn giản (Testing)
**POST** `/api/notification/send-simple?token=xxx&title=Test&body=Hello`

**Query Parameters:**
- `token`: FCM token của thiết bị
- `title`: Tiêu đề thông báo
- `body`: Nội dung thông báo

**Response:**
```json
{
  "success": true,
  "message": "Simple notification sent successfully"
}
```

---

### 8. Gửi thông báo test
**POST** `/api/notification/test`

**Request Body:** (Plain text)
```
Test notification content
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully"
}
```

---

## Cấu trúc Code

### 1. DTOs
- `PushNotiRequest.java`: DTO cho request gửi thông báo
- `SaveTokenDTO.java`: DTO cho lưu/cập nhật FCM token
- `NotiSystemDTO.java`: DTO cho thông báo hệ thống
- `NotiTransactionDTO.java`: DTO cho thông báo giao dịch

### 2. Service Layer
- `FirebaseNotificationService.java`: Service giao tiếp với Firebase Service thông qua `HttpUltils`

### 3. Controller
- `NotiManagerment.java`: REST Controller cung cấp các endpoints

### 4. Utils
- `HttpUltils.java`: Utility class để gọi HTTP requests (GET, POST với/không headers)

---

## Luồng hoạt động

```
AdminTool Controller (NotiManagerment)
    ↓
FirebaseNotificationService
    ↓
HttpUltils (RestTemplate)
    ↓
Firebase Service (NotificationController)
    ↓
FCM / Database
```

---

## Error Handling

Tất cả các endpoints đều có error handling:
- Trả về HTTP 200 với `success: false` khi có lỗi logic
- Trả về HTTP 500 khi có lỗi hệ thống
- Log chi tiết lỗi vào file log

**Error Response Example:**
```json
{
  "success": false,
  "message": "Error: Connection refused"
}
```

---

## Testing

### Sử dụng cURL:

1. **Lưu token:**
```bash
curl -X POST http://localhost:8081/api/notification/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "deviceId": "device-abc",
    "token": "fcm-token-xyz"
  }'
```

2. **Gửi thông báo cho tất cả:**
```bash
curl -X POST http://localhost:8081/api/notification/push-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Hello everyone"
  }'
```

3. **Lấy thông báo hệ thống:**
```bash
curl http://localhost:8081/api/notification/system?index=0&limit=10
```

---

## Lưu ý

1. **Firebase Service phải chạy trước** khi sử dụng các API này
2. **Port mặc định:**
   - AdminTool: 8081
   - Firebase Service: 8083
3. **Context path:** `/api` (đã được cấu hình trong application.yml)
4. Đảm bảo `RestTemplate` bean đã được cấu hình trong Spring context
5. Tất cả các request/response đều sử dụng JSON format (trừ endpoint `/test`)

---

## Troubleshooting

### 1. Connection refused
- Kiểm tra Firebase Service có đang chạy không
- Kiểm tra URL trong `application.yml`

### 2. 404 Not Found
- Kiểm tra context path: `/api`
- Kiểm tra endpoint path

### 3. RestTemplate bean not found
- Thêm `@Bean` cho RestTemplate trong config class

### 4. Package name mismatch
- Đảm bảo package name trong `HttpUltils.java` là `com.ebanking.adminTool.utils`
