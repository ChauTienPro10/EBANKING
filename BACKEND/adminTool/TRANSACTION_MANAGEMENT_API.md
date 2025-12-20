# Transaction Management API

## Overview
This API provides transaction history management functionality for admin users.

## Endpoints

### Get Transaction History
**GET** `/api/admin/transactions`

Retrieves paginated transaction history with optional filtering.

#### Query Parameters
- `page` (optional, default: 0) - Page number (0-based)
- `size` (optional, default: 10) - Page size (1-100)
- `search` (optional) - Search term for username, account numbers, or description
- `type` (optional) - Filter by transaction type
- `status` (optional) - Filter by transaction status
- `fromDate` (optional) - Filter transactions from this date (YYYY-MM-DD format)
- `toDate` (optional) - Filter transactions to this date (YYYY-MM-DD format)

#### Response
```json
{
  "transactions": [
    {
      "transactionId": 1,
      "username": "user123",
      "senderAccountNumber": "1234567890",
      "senderFullName": "John Doe",
      "receiverAccountNumber": "0987654321",
      "receiverFullName": "Jane Smith",
      "amount": 1000.00,
      "currency": "VND",
      "transactionType": "TRANSFER",
      "status": "COMPLETED",
      "description": "Payment for services",
      "failureReason": null,
      "transactionAt": "2024-12-20T10:30:00",
      "requiresFaceAuth": false,
      "faceAuthSessionId": null,
      "faceAuthVerified": false,
      "faceAuthAt": null
    }
  ],
  "currentPage": 0,
  "totalPages": 5,
  "totalElements": 50,
  "pageSize": 10,
  "hasNext": true,
  "hasPrevious": false
}
```

#### Status Codes
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin access required
- `500 Internal Server Error` - Server error

## Features
- **Pagination**: Efficient pagination with configurable page size
- **Search**: Full-text search across username, account numbers, and description
- **Filtering**: Filter by transaction type, status, and date range
- **Full Name Mapping**: Automatically maps account numbers to user full names
- **Face Authentication Info**: Includes face authentication details when applicable

## Database Configuration
The service uses external database connections configured in `.env`:
- `transactionService` - For transaction data
- `userService` - For user information and full names

## Security
- Requires admin authentication
- All operations are logged with admin user information
- Input validation for all parameters