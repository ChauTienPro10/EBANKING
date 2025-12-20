# Notification Management API Documentation

## Overview
This API provides endpoints for managing notifications from the Admin Tool, which acts as a proxy to the Firebase Service.

## Base URL
```
/notification
```

## Endpoints

### 1. Push Notification to All Users
**POST** `/notification/push-all`

Send notification to all registered users.

**Request Body:**
```json
{
  "title": "System Announcement",
  "content": "The system will be under maintenance tonight from 2 AM to 4 AM."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to all users successfully"
}
```

### 2. Push Notification to Single User
**POST** `/notification/push-to-user`

Send notification to a specific user.

**Request Body:**
```json
{
  "username": "john_doe",
  "title": "Account Alert",
  "content": "Your account balance is low. Please add funds."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to user successfully"
}
```

### 3. Push Notification to Multiple Users (NEW)
**POST** `/notification/push-to-users`

Send notification to multiple specific users.

**Request Body:**
```json
{
  "usernames": ["john_doe", "jane_smith", "bob_wilson"],
  "title": "Important Update",
  "content": "New security features have been added to your account."
}
```

**Response:**
```json
{
  "success": true,
  "totalUsers": 3,
  "successCount": 2,
  "failedCount": 1,
  "message": "Bulk notification processed: 2 successful, 1 failed out of 3 users",
  "failedUsers": ["bob_wilson"]
}
```

### 4. Get System Notifications
**GET** `/notification/system`

Retrieve system notifications with pagination.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Number of items per page (default: 10)

**Example:**
```
GET /notification/system?index=0&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "System Maintenance",
      "content": "Scheduled maintenance tonight",
      "createdAt": 1703123456789
    }
  ],
  "index": 0,
  "limit": 20,
  "count": 1
}
```

### 5. Get Transaction Notifications
**GET** `/notification/transaction`

Retrieve transaction notifications with pagination.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Number of items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "title": "Transaction Alert",
      "content": "You received $100",
      "sender": "jane_smith",
      "amount": "100.00",
      "status": "SUCCESS",
      "createdAt": 1703123456789
    }
  ],
  "index": 0,
  "limit": 10,
  "count": 1
}
```

## Token Management Endpoints

### 6. Save FCM Token
**POST** `/notification/save-token`

Save FCM token for a user (typically called from mobile app).

**Request Body:**
```json
{
  "username": "john_doe",
  "deviceId": "device123",
  "token": "fcm_token_here",
  "userId": 1
}
```

### 7. Update FCM Token
**POST** `/notification/update-token`

Update existing FCM token for a user.

**Request Body:**
```json
{
  "username": "john_doe",
  "deviceId": "device123",
  "token": "new_fcm_token_here",
  "userId": 1
}
```

## Testing Endpoints

### 8. Send Simple Notification
**POST** `/notification/send-simple`

Send a simple notification for testing purposes.

**Parameters:**
- `token` (query): FCM token
- `title` (query): Notification title
- `body` (query): Notification body

### 9. Push Test Notification
**POST** `/notification/test`

Send a test notification with content.

**Request Body:** Plain text content

## Bulk Notification Features

### Performance Benefits
- **Efficient Processing**: Single API call handles multiple users
- **Firebase Multicast**: Uses Firebase's optimized multicast messaging
- **Batch Operations**: Optimized database operations for better performance

### Error Handling
- **Individual User Failures**: Continues processing even if some users fail
- **Detailed Reporting**: Returns specific information about success/failure
- **Graceful Degradation**: Partial success is still reported as successful operation

### Response Structure for Bulk Operations
```json
{
  "success": true,
  "totalUsers": 5,
  "successCount": 4,
  "failedCount": 1,
  "message": "Bulk notification processed: 4 successful, 1 failed out of 5 users",
  "failedUsers": ["inactive_user"]
}
```

## Use Cases

### System Announcements
```json
POST /notification/push-all
{
  "title": "Maintenance Notice",
  "content": "System will be down for maintenance from 2-4 AM"
}
```

### Targeted User Communication
```json
POST /notification/push-to-users
{
  "usernames": ["premium_user1", "premium_user2", "premium_user3"],
  "title": "Premium Feature Update",
  "content": "New premium features are now available in your account"
}
```

### Individual User Alerts
```json
POST /notification/push-to-user
{
  "username": "john_doe",
  "title": "Security Alert",
  "content": "Unusual login activity detected on your account"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Usernames list is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error: Failed to connect to Firebase Service"
}
```

## Configuration

The service requires the following configuration in `application.properties`:

```properties
firebase.service.url=http://localhost:8084/notify
```

## Architecture

```
AdminTool Controller -> AdminTool Service -> HTTP Client -> Firebase Service -> FCM
```

The AdminTool acts as a proxy/gateway to the Firebase Service, providing:
- **Centralized Management**: Single point for notification management
- **Authentication/Authorization**: Admin-level access control
- **Logging & Monitoring**: Centralized logging for admin operations
- **Error Handling**: Consistent error responses for admin interface

## Security Considerations

- **Admin Authentication**: Ensure proper admin authentication before allowing notification operations
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Content Validation**: Validate notification content for security
- **User Privacy**: Ensure compliance with privacy regulations
- **Audit Logging**: Log all notification operations for audit purposes

## Best Practices

1. **Batch Operations**: Use bulk endpoints for multiple users instead of individual calls
2. **Error Handling**: Always check response for failed users and handle appropriately
3. **Content Guidelines**: Keep notifications concise and actionable
4. **Timing**: Consider user timezones and preferences
5. **Testing**: Use test endpoints before sending to production users

## Notification History Endpoints (NEW)

### 1. Get All Notification History
**GET** `/notification/history`

Retrieve all types of notifications with pagination.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "System Maintenance",
      "content": "Scheduled maintenance tonight",
      "type": "SYSTEM",
      "createdAt": 1703123456789
    },
    {
      "id": 2,
      "title": "Personal Message",
      "content": "Your account has been updated",
      "type": "PERSONAL",
      "username": "john_doe",
      "createdAt": 1703123456790
    },
    {
      "id": 3,
      "title": "Transaction Alert",
      "content": "You received money",
      "type": "TRANSACTION",
      "username": "john_doe",
      "sender": "jane_smith",
      "amount": "100.00",
      "status": "SUCCESS",
      "noiDungGiaoDich": "Transfer from Jane",
      "createdAt": 1703123456791
    }
  ],
  "index": 0,
  "limit": 10,
  "count": 3,
  "totalCount": 150,
  "totalPages": 15
}
```

### 2. Get System Notification History
**GET** `/notification/history/system`

Retrieve only system notifications.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Items per page (default: 10)

### 3. Get Personal Notification History
**GET** `/notification/history/personal`

Retrieve personal notifications with optional username filter.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Items per page (default: 10)
- `username` (query, optional): Filter by specific username

**Examples:**
- `/notification/history/personal` - All personal notifications
- `/notification/history/personal?username=john_doe` - Specific user's notifications

### 4. Get Transaction Notification History
**GET** `/notification/history/transaction`

Retrieve transaction notifications with optional username filter.

**Parameters:**
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Items per page (default: 10)
- `username` (query, optional): Filter by specific username

### 5. Filter Notifications by Date Range
**GET** `/notification/history/filter`

Filter notifications by date range and type.

**Parameters:**
- `fromDate` (query, required): Start timestamp (milliseconds)
- `toDate` (query, required): End timestamp (milliseconds)
- `type` (query, optional): Notification type - "SYSTEM", "PERSONAL", "TRANSACTION", or "ALL" (default: "ALL")

**Example:**
```
GET /notification/history/filter?fromDate=1703000000000&toDate=1703200000000&type=PERSONAL
```

### 6. Advanced Search Notifications (NEW)
**GET** `/notification/search`

Advanced search with multiple filter criteria including title search.

**Parameters:**
- `title` (query, optional): Search in notification titles (partial match)
- `fromDate` (query, optional): Start timestamp (milliseconds)
- `toDate` (query, optional): End timestamp (milliseconds)
- `type` (query, optional): Notification type - "SYSTEM", "PERSONAL", "TRANSACTION", or "ALL" (default: "ALL")
- `username` (query, optional): Filter by specific username (for personal/transaction notifications)
- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Items per page (default: 10)

**Note:** At least one search criteria must be provided.

**Examples:**
```
GET /notification/search?title=maintenance
GET /notification/search?title=account&type=PERSONAL
GET /notification/search?username=john_doe&fromDate=1703000000000
GET /notification/search?title=transaction&toDate=1703200000000&type=TRANSACTION
GET /notification/search?fromDate=1703000000000&toDate=1703200000000&type=SYSTEM&index=0&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "System Maintenance Alert",
      "content": "Scheduled maintenance tonight from 2-4 AM",
      "type": "SYSTEM",
      "createdAt": 1703123456789
    },
    {
      "id": 2,
      "title": "Account Maintenance",
      "content": "Your account maintenance is complete",
      "type": "PERSONAL",
      "username": "john_doe",
      "createdAt": 1703123456790
    }
  ],
  "index": 0,
  "limit": 10,
  "count": 2,
  "totalCount": 25,
  "totalPages": 3,
  "searchCriteria": {
    "title": "maintenance",
    "type": "ALL"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 25,
  "fromDate": 1703000000000,
  "toDate": 1703200000000,
  "type": "PERSONAL"
}
```

## Database Architecture

The notification history feature connects directly to the FCM Service database:

```
AdminTool -> ExternalDbConfig -> DB_FCM_SERVICE
```

**Tables:**
- `noti_system` - System-wide notifications
- `persional_noti` - Personal user notifications  
- `noti_transaction` - Transaction-related notifications

## Direct Database Access Features

### Performance Benefits
- **Direct Queries**: No API overhead, direct database access
- **Complex Filtering**: Advanced SQL queries for precise data retrieval
- **Batch Operations**: Efficient handling of large datasets
- **Real-time Data**: Always up-to-date information

### Unified History Management
- **All Types**: View system, personal, and transaction notifications together
- **Advanced Filtering**: Filter by type, user, date range, and more
- **Efficient Pagination**: Optimized pagination for large notification histories
- **Chronological Sorting**: Automatic sorting by creation timestamp

## Advanced Search Features (NEW)

### Multi-Criteria Search
The new `/notification/search` endpoint supports combining multiple search criteria:

- **Title Search**: Find notifications containing specific keywords in titles
- **Date Range**: Filter by creation date range (from/to timestamps)
- **Type Filter**: Limit to specific notification types
- **User Filter**: Search notifications for specific users
- **Pagination**: Efficient pagination with total count information

### Search Examples

#### Search by Title
```bash
# Find all notifications with "maintenance" in title
GET /notification/search?title=maintenance

# Find personal notifications with "account" in title
GET /notification/search?title=account&type=PERSONAL
```

#### Search by Date Range
```bash
# Find notifications from last week
GET /notification/search?fromDate=1703000000000&toDate=1703600000000

# Find system notifications from specific date range
GET /notification/search?fromDate=1703000000000&toDate=1703600000000&type=SYSTEM
```

#### Search by User
```bash
# Find all notifications for specific user
GET /notification/search?username=john_doe

# Find transaction notifications for user in date range
GET /notification/search?username=john_doe&type=TRANSACTION&fromDate=1703000000000
```

#### Combined Search
```bash
# Complex search: title + user + date range + type
GET /notification/search?title=transfer&username=john_doe&type=TRANSACTION&fromDate=1703000000000&toDate=1703600000000&limit=20
```

### Search Response Features
- **Total Count**: Shows total matching records across all pages
- **Search Criteria Echo**: Returns the search criteria used for reference
- **Pagination Info**: Complete pagination metadata
- **Performance Optimized**: Efficient SQL queries with proper indexing