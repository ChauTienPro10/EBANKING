# Account Lock Middleware

## Overview
The MiddleWare filter automatically checks if users attempting to perform transactions are locked in the `LOCK_ACCOUNT` table and blocks them with a 403 Forbidden response.

## Features
- **Automatic Lock Checking**: Intercepts all transaction-related requests
- **Multiple Username Extraction**: Supports username extraction from:
  - Query parameters (`?username=xxx`)
  - JSON request body (`{"username": "xxx"}`)
  - JWT Authorization tokens (`Bearer <token>`)
- **Comprehensive Coverage**: Applies to all transaction endpoints:
  - `POST /transaction/transfer` - Money transfers
  - `GET /transaction/history` - Transaction history
  - `POST /trans/account/new` - New account creation
  - Any POST/PUT/PATCH on `/transaction` or `/trans/account` paths

## How It Works

### 1. Request Interception
The filter runs with `@Order(2)` and intercepts requests before they reach the controllers.

### 2. Transaction Endpoint Detection
```java
private boolean isTransactionEndpoint(HttpServletRequest request) {
    // Checks for specific transaction endpoints
    // Covers transfer, history, and account creation
}
```

### 3. Username Extraction
The filter tries multiple methods to extract the username:

**From Query Parameters:**
```
GET /transaction/history?username=john_doe
```

**From JSON Body:**
```json
POST /transaction/transfer
{
  "username": "john_doe",
  "senderAccountNumber": "123456",
  "receiverAccountNumber": "789012",
  "amount": 1000
}
```

**From JWT Token:**
```
POST /trans/account/new
Authorization: Bearer <jwt_token>
```

### 4. Lock Status Check
```java
if (lockAccountService.isAccountLocked(username)) {
    // Block the request with 403 Forbidden
    sendForbiddenResponse(response, username);
    return;
}
```

### 5. Error Response
When a locked account attempts a transaction:

```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Tài khoản của bạn đã bị khóa và không thể thực hiện giao dịch",
  "username": "john_doe",
  "timestamp": 1703123456789,
  "status": 403,
  "lockReason": "Suspicious activity detected",
  "lockType": "ADMIN_LOCK",
  "lockedAt": "2024-12-20T10:30:00",
  "lockedBy": "admin"
}
```

## Protected Endpoints

### TransactionController Endpoints:
- `POST /authService/transaction/transfer` - Money transfers
- `GET /authService/transaction/history` - Transaction history

### AccountTransactionController Endpoints:
- `POST /authService/trans/account/new` - New account creation
- `GET /authService/trans/account/info/{userId}` - Account info (read-only, not blocked)
- `POST /authService/trans/account/checkAccountNumber` - Account validation (not blocked)

## Configuration
The middleware automatically:
- Injects `LockAccountService` for lock status checking
- Injects `JWTUtils` for token-based username extraction
- Uses `CachedBodyHttpServletRequest` to read request bodies multiple times
- Provides detailed logging for security monitoring

## Security Benefits
- **Proactive Protection**: Blocks locked accounts before they reach business logic
- **Comprehensive Coverage**: Works across all transaction types
- **Detailed Logging**: Logs all blocked attempts for security monitoring
- **Flexible Authentication**: Supports both parameter-based and JWT-based authentication
- **Rich Error Information**: Provides detailed lock information to clients

## Performance Considerations
- **Minimal Overhead**: Only processes transaction-related requests
- **Efficient Caching**: Uses request body caching only when necessary
- **Database Optimization**: Leverages indexed queries in `LockAccountRepository`
- **Early Exit**: Blocks requests before expensive business logic execution