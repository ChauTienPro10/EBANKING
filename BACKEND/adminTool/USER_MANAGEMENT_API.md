# User Management API Documentation

This API provides endpoints to manage and retrieve user information from the external DB_USER_SERVICE database.

## Base URL
```
http://localhost:7999/api/admin/users
```

## Endpoints

### 1. Get All Users
**GET** `/api/admin/users`

Returns all users from the DB_USER_SERVICE database.

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "citizenId": "123456789",
      "birthday": 631152000000,
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "isMale": true,
      "address": "123 Main St",
      "createAt": 1703808000000,
      "updatedAt": 1703808000000,
      "userId": 1,
      "username": "johndoe",
      "ekycSessionId": "550e8400-e29b-41d4-a716-446655440000",
      "ekycStatus": "VERIFIED",
      "ekycVerifiedAt": "2024-12-19T10:30:00",
      "avatarPath": "avatars/1/avatar_1_20241219.jpg",
      "faceAuthEnabled": true,
      "dailyTransactionLimit": 50000000.00
    }
  ]
}
```

### 2. Get User by ID
**GET** `/api/admin/users/{id}`

Returns a specific user by their ID.

**Parameters:**
- `id` (path parameter): User ID

**Response:**
```json
{
  "success": true,
  "message": "User found",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    // ... other user fields
  }
}
```

### 3. Search Users
**GET** `/api/admin/users/search?name={searchTerm}`

Search users by full name or username.

**Parameters:**
- `name` (query parameter): Search term for full name or username

**Response:**
```json
{
  "success": true,
  "message": "Search completed",
  "data": [
    // Array of matching users
  ]
}
```

### 4. Get Users with Pagination
**GET** `/api/admin/users/paginated?page={page}&size={size}`

Returns users with pagination support.

**Parameters:**
- `page` (query parameter, optional): Page number (default: 0)
- `size` (query parameter, optional): Page size (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    // Array of users for the requested page
  ]
}
```

### 5. Get Total User Count
**GET** `/api/admin/users/count`

Returns the total number of users in the database.

**Response:**
```json
{
  "success": true,
  "message": "User count retrieved",
  "data": 150
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Configuration

The API uses the external database configuration from `application.properties`:

```properties
external-dbs.names=DB_USER_SERVICE,DB_TRANSACTION_SERVICE,DB_FCM_SERVICE
external-dbs.DB_USER_SERVICE.url=jdbc:mysql://localhost:3306/DB_USER_SERVICE
external-dbs.DB_USER_SERVICE.username=root
external-dbs.DB_USER_SERVICE.password=root@123
```

## Database Schema

The API queries the following tables:
- `user_info`: Contains user personal information
- `user`: Contains user authentication information

The tables are joined using the `user_id` foreign key relationship.