# Analytics Controller - Hướng dẫn sử dụng

## 📋 Tổng quan

`AnalyticsController` trong authService hoạt động như một **API Gateway** để gọi đến các endpoint analytics trong transactionService.

## 🏗️ Kiến trúc

```
Client → authService (AnalyticsController) → transactionService (AnalysController)
```

## ⚙️ Cấu hình

### 1. Thêm vào `application.properties`

```properties
# URL của transactionService
transaction.service.url=http://localhost:8081
```

**Lưu ý:** 
- Thay đổi port `8081` thành port thực tế của transactionService
- Trong production, sử dụng service discovery hoặc load balancer URL

### 2. Đảm bảo RestTemplate được config

Kiểm tra file `SecurityConfig.java` hoặc tạo Bean:

```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## 📡 API Endpoints

### 1. Get Analytics Info (Last 30 days)
```http
POST http://localhost:8080/analytics/info
Content-Type: application/json

{
  "userId": "user123"
}
```

**Response:**
```json
{
  "totalAmountInPeriodByUsername": 1000000,
  "transactionLargestInPeriodByUsername": {...},
  "mostAccountInfoTransferManyTimeInPeriod": {...},
  "transferHasAmountLargestInPeriod": 500000,
  "accountHasBeenTransferWithTheMostAmountInPeriod": 123456,
  "midnightTransactionsCount": 2,
  "frequentTransactionsToSameAccountCount": 5
}
```

### 2. Get Current Month Analytics
```http
GET http://localhost:8080/analytics/current-month/user123
```

### 3. Get Previous Month Analytics
```http
GET http://localhost:8080/analytics/previous-month/user123
```

### 4. Get Current Week Analytics
```http
GET http://localhost:8080/analytics/current-week/user123
```

### 5. Get Previous Week Analytics
```http
GET http://localhost:8080/analytics/previous-week/user123
```

### 6. Get Custom Period Analytics
```http
GET http://localhost:8080/analytics/custom/user123?fromDate=1702684800&toDate=1702771200
```

**Query Parameters:**
- `fromDate`: Unix timestamp (seconds) - Thời gian bắt đầu
- `toDate`: Unix timestamp (seconds) - Thời gian kết thúc

## 🔧 Cách hoạt động

### Luồng xử lý:

1. **Client gọi authService:**
   ```
   GET http://localhost:8080/analytics/current-month/user123
   ```

2. **AnalyticsController nhận request:**
   ```java
   @GetMapping("/current-month/{username}")
   public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
       String url = transactionServiceUrl + "/analytics/current-month/" + username;
       Object response = httpUtils.get(url, Object.class);
       return ResponseEntity.ok(response);
   }
   ```

3. **HttpUltils gọi transactionService:**
   ```
   GET http://localhost:8081/analytics/current-month/user123
   ```

4. **transactionService xử lý và trả về:**
   ```json
   {
     "totalAmountInPeriodByUsername": 1000000,
     ...
   }
   ```

5. **authService forward response về Client**

## 🛡️ Bảo mật

### Thêm kiểm tra quyền (Khuyến nghị):

```java
@Autowired
private SecurityUtils securityUtils;

@GetMapping("/current-month/{username}")
public ResponseEntity<?> getAnalysCurrentMonth(
        @PathVariable String username,
        @RequestHeader Map<String, String> headers) {
    
    // Kiểm tra quyền: User chỉ xem analytics của chính họ
    if (!securityUtils.checkUser(headers, username)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Bạn không có quyền xem thông tin này"));
    }
    
    // Tiếp tục xử lý...
}
```

## 🧪 Test với cURL

### Test 1: Get current month analytics
```bash
curl -X GET http://localhost:8080/analytics/current-month/user123 \
  -H "Authorization: Bearer <your_token>"
```

### Test 2: Get custom period
```bash
curl -X GET "http://localhost:8080/analytics/custom/user123?fromDate=1702684800&toDate=1702771200" \
  -H "Authorization: Bearer <your_token>"
```

### Test 3: Get info (POST)
```bash
curl -X POST http://localhost:8080/analytics/info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"userId":"user123"}'
```

## ⚠️ Xử lý lỗi

### Lỗi kết nối đến transactionService:
```json
{
  "error": "Internal server error",
  "message": "Connection refused: connect"
}
```

**Giải pháp:**
- Kiểm tra transactionService có đang chạy không
- Kiểm tra URL trong `application.properties`
- Kiểm tra firewall/network

### Lỗi invalid date range:
```json
{
  "error": "Invalid date range",
  "message": "fromDate must be less than toDate"
}
```

## 🚀 Cải tiến

### 1. Thêm Circuit Breaker (Resilience4j)

```java
@CircuitBreaker(name = "transactionService", fallbackMethod = "fallbackAnalytics")
@GetMapping("/current-month/{username}")
public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
    // ...
}

public ResponseEntity<?> fallbackAnalytics(String username, Exception e) {
    log.error("Circuit breaker activated for user: {}", username, e);
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(Map.of("error", "Service temporarily unavailable"));
}
```

### 2. Thêm Caching

```java
@Cacheable(value = "analytics", key = "#username")
@GetMapping("/current-month/{username}")
public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
    // ...
}
```

### 3. Thêm Retry Logic

```java
@Retry(name = "transactionService", fallbackMethod = "fallbackAnalytics")
@GetMapping("/current-month/{username}")
public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
    // ...
}
```

## 📊 Monitoring

### Thêm metrics:

```java
@Autowired
private MeterRegistry meterRegistry;

@GetMapping("/current-month/{username}")
public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
    Timer.Sample sample = Timer.start(meterRegistry);
    
    try {
        // Xử lý...
        sample.stop(Timer.builder("analytics.request")
            .tag("endpoint", "current-month")
            .tag("status", "success")
            .register(meterRegistry));
    } catch (Exception e) {
        sample.stop(Timer.builder("analytics.request")
            .tag("endpoint", "current-month")
            .tag("status", "error")
            .register(meterRegistry));
        throw e;
    }
}
```

## 📝 Checklist

- [x] Tạo AnalyticsController
- [x] Sử dụng HttpUltils
- [x] Tạo tất cả endpoints
- [ ] Thêm vào application.properties: `transaction.service.url`
- [ ] Kiểm tra RestTemplate bean
- [ ] Thêm kiểm tra quyền (SecurityUtils)
- [ ] Test tất cả endpoints
- [ ] Thêm Circuit Breaker (optional)
- [ ] Thêm Caching (optional)
- [ ] Thêm Monitoring (optional)
