# Account Management API Documentation

## Overview
This API provides endpoints for managing transaction accounts from the Transaction Service database through the Admin Tool.

## Base URL
```
/accounts
```

## Endpoints

### 1. Get All Accounts
**GET** `/accounts`

Returns a list of all accounts in the system with user full names and lock status.

**Response:**
```json
[
  {
    "accountId": 1,
    "accountNumber": "ACC001",
    "accountType": "SAVINGS",
    "balance": 1000.00,
    "currency": "USD",
    "status": "ACTIVE",
    "openedDate": "2024-01-01T10:00:00",
    "closedDate": null,
    "isPrimary": true,
    "userId": 1,
    "userFullName": "John Doe",
    "lastTransactionAt": "2024-01-15T14:30:00",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T14:30:00",
    "isLocked": false,
    "lockType": null,
    "lockReason": null,
    "lockedAt": null,
    "lockedBy": null,
    "unlockedAt": null,
    "unlockedBy": null,
    "lockNotes": null
  },
  {
    "accountId": 2,
    "accountNumber": "ACC002",
    "accountType": "CHECKING",
    "balance": 500.00,
    "currency": "USD",
    "status": "ACTIVE",
    "openedDate": "2024-01-02T10:00:00",
    "closedDate": null,
    "isPrimary": false,
    "userId": 2,
    "userFullName": "Jane Smith",
    "lastTransactionAt": "2024-01-16T09:15:00",
    "createdAt": "2024-01-02T10:00:00",
    "updatedAt": "2024-01-16T09:15:00",
    "isLocked": true,
    "lockType": "ADMIN_LOCK",
    "lockReason": "Suspicious activity detected",
    "lockedAt": "2024-01-16T10:00:00",
    "lockedBy": "admin",
    "unlockedAt": null,
    "unlockedBy": null,
    "lockNotes": "Account locked pending investigation"
  }
]
```

### 2. Get Account by ID
**GET** `/accounts/{accountId}`

Returns a specific account by its ID.

**Parameters:**
- `accountId` (path): Account ID

**Response:**
- `200 OK`: Account found
- `404 Not Found`: Account not found

### 3. Get Account by Number
**GET** `/accounts/number/{accountNumber}`

Returns a specific account by its account number.

**Parameters:**
- `accountNumber` (path): Account number

**Response:**
- `200 OK`: Account found
- `404 Not Found`: Account not found

### 4. Get Accounts by User ID
**GET** `/accounts/user/{userId}`

Returns all accounts belonging to a specific user.

**Parameters:**
- `userId` (path): User ID

**Response:**
```json
[
  {
    "accountId": 1,
    "accountNumber": "ACC001",
    "accountType": "SAVINGS",
    "balance": 1000.00,
    "currency": "USD",
    "status": "ACTIVE",
    "openedDate": "2024-01-01T10:00:00",
    "closedDate": null,
    "isPrimary": true,
    "userId": 1,
    "userFullName": "John Doe",
    "lastTransactionAt": "2024-01-15T14:30:00",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T14:30:00"
  }
]
```

### 5. Get Accounts by Status
**GET** `/accounts/status/{status}`

Returns all accounts with a specific status.

**Parameters:**
- `status` (path): Account status (ACTIVE, INACTIVE, CLOSED, SUSPENDED)

**Response:**
Array of accounts with the specified status.

### 6. Update Account Status
**PUT** `/accounts/{accountId}/status`

Updates the status of a specific account.

**Parameters:**
- `accountId` (path): Account ID

**Request Body:**
```json
{
  "status": "SUSPENDED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account status updated successfully"
}
```

### 7. Update Account Balance
**PUT** `/accounts/{accountId}/balance`

Updates the balance of a specific account.

**Parameters:**
- `accountId` (path): Account ID

**Request Body:**
```json
{
  "balance": 1500.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account balance updated successfully"
}
```

### 8. Close Account
**PUT** `/accounts/{accountId}/close`

Closes a specific account by setting its status to CLOSED and setting the closed date.

**Parameters:**
- `accountId` (path): Account ID

**Response:**
```json
{
  "success": true,
  "message": "Account closed successfully"
}
```

### 9. Search Accounts
**GET** `/accounts/search`

Search accounts by user information, account number, or general keyword.

**Parameters:**
- `userName` (query, optional): Search by user information (name, email, phone, citizenId - partial match)
- `accountNumber` (query, optional): Search by account number (partial match)
- `keyword` (query, optional): General search across all fields (account number, user name, email, phone, citizenId)

**Note:** At least one parameter must be provided. If `keyword` is provided, it takes precedence over other parameters.

**Search Capabilities:**
- **User Name Search**: Searches across full name, email, phone number, and citizen ID
- **Account Number Search**: Searches account numbers with partial matching
- **Keyword Search**: Comprehensive search across all searchable fields
- **Duplicate Prevention**: Automatically removes duplicate results when using multiple criteria

**Examples:**
- `/accounts/search?userName=John` (searches name, email, phone, citizenId)
- `/accounts/search?accountNumber=ACC001`
- `/accounts/search?userName=John&accountNumber=001`
- `/accounts/search?keyword=john@email.com` (comprehensive search)
- `/accounts/search?keyword=0123456789` (finds by phone or citizenId)

**Response:**
```json
[
  {
    "accountId": 1,
    "accountNumber": "ACC001",
    "accountType": "SAVINGS",
    "balance": 1000.00,
    "currency": "USD",
    "status": "ACTIVE",
    "openedDate": "2024-01-01T10:00:00",
    "closedDate": null,
    "isPrimary": true,
    "userId": 1,
    "userFullName": "John Doe",
    "lastTransactionAt": "2024-01-15T14:30:00",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T14:30:00",
    "isLocked": false,
    "lockType": null,
    "lockReason": null,
    "lockedAt": null,
    "lockedBy": null,
    "unlockedAt": null,
    "unlockedBy": null,
    "lockNotes": null
  }
]
```

### 10. Lock Account
**POST** `/accounts/{accountId}/lock`

Lock a specific account with reason and admin information.

**Parameters:**
- `accountId` (path): Account ID to lock

**Request Body:**
```json
{
  "reason": "Suspicious activity detected",
  "lockedBy": "admin_username",
  "notes": "Account locked pending investigation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account locked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If account is already locked or required fields are missing
- `404 Not Found`: If account doesn't exist

### 11. Unlock Account
**POST** `/accounts/{accountId}/unlock`

Unlock a previously locked account.

**Parameters:**
- `accountId` (path): Account ID to unlock

**Request Body:**
```json
{
  "unlockedBy": "admin_username"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account unlocked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If account is not locked or required fields are missing
- `404 Not Found`: If account doesn't exist

### 12. Check Account Lock Status
**GET** `/accounts/{accountId}/lock-status`

Check if a specific account is currently locked.

**Parameters:**
- `accountId` (path): Account ID to check

**Response:**
```json
{
  "accountId": 1,
  "isLocked": true
}
```

### 13. Get Account Statistics
**GET** `/accounts/statistics`

Returns statistical information about accounts including lock status.

**Response:**
```json
{
  "totalAccounts": 150,
  "activeAccounts": 120,
  "lockedAccounts": 5,
  "totalBalance": 500000.00
}
```

## Account Lock Status Fields

The API now includes lock status information from the Auth Service:

- `isLocked` (Boolean): Whether the account is currently locked
- `lockType` (String): Type of lock - "ADMIN_LOCK" or "SELF_LOCK"
- `lockReason` (String): Reason for locking the account
- `lockedAt` (LocalDateTime): When the account was locked
- `lockedBy` (String): Username of who locked the account
- `unlockedAt` (LocalDateTime): When the account was unlocked (null if still locked)
- `unlockedBy` (String): Username of who unlocked the account (null if still locked)
- `lockNotes` (String): Additional notes about the lock

## Account Status Values
- `ACTIVE`: Account is active and can be used for transactions
- `INACTIVE`: Account is temporarily inactive
- `CLOSED`: Account is permanently closed
- `SUSPENDED`: Account is suspended due to security or compliance issues
- `LOCKED`: Account is locked by administrator (automatically set when account is locked)

## Lock Types
- `ADMIN_LOCK`: Account locked by administrator
- `SELF_LOCK`: Account locked by the user themselves

## Account Types
- `SAVINGS`: Savings account
- `CHECKING`: Checking account
- `BUSINESS`: Business account
- `JOINT`: Joint account

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Status is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Account not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## Database Configuration

The controller connects to multiple service databases using the external database configuration:

```properties
external-dbs.names=transactionService,userService,authService
external-dbs.transactionService.url=jdbc:mysql://localhost:3307/DB_TRANSACTION_SERVICE
external-dbs.userService.url=jdbc:mysql://localhost:3307/DB_USER_SERVICE
external-dbs.authService.url=jdbc:mysql://localhost:3307/DB_AUTH_SERVICE
```

- **Transaction Service**: Account data and balances
- **User Service**: User information (full names)
- **Auth Service**: Account lock status and history

## Security Notes

- All endpoints require proper authentication and authorization
- Account balance updates should be logged for audit purposes
- Status changes should be validated based on business rules
- Sensitive operations like account closure should require additional verification
- **Account locking/unlocking operations are logged with admin information**
- **Lock reasons are mandatory and should be descriptive**
- **Only authorized administrators can lock/unlock accounts**
- **Lock operations check for existing lock status to prevent conflicts**
- **When an account is locked, its status is automatically changed to "LOCKED"**
- **When an account is unlocked, its status is restored to "ACTIVE"**
- **Locked accounts cannot perform transactions until unlocked**