# Personal Notification API Documentation

## Overview

This API provides endpoints for sending and managing personal notifications to specific users in the Firebase Service.

## Base URL

```
/notify
```

## Endpoints

### 1. Send Personal Notification

**POST** `/notify/push-noti-persional`

Send a personal notification to a specific user by username.

**Request Body:**

```json
{
  "username": "john_doe",
  "title": "Personal Message",
  "content": "This is a personal notification for you."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Personal notification sent successfully"
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or user has no FCM token
- `500 Internal Server Error`: Server error during notification sending

**Features:**

- Validates that the user has an FCM token registered
- Saves the notification to the `persional_noti` table
- Sends real-time push notification via Firebase
- Returns detailed success/error messages

### 2. Send Bulk Personal Notifications

**POST** `/notify/push-noti-bulk`

Send personal notifications to multiple users at once.

**Request Body:**

```json
{
  "usernames": ["john_doe", "jane_smith", "bob_wilson"],
  "title": "System Maintenance",
  "content": "The system will be under maintenance from 2 AM to 4 AM tomorrow."
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

**Features:**

- **Batch Processing**: Efficiently processes multiple users in a single request
- **Firebase Multicast**: Uses Firebase's multicast feature for optimal performance
- **Detailed Reporting**: Returns success/failure counts and failed user list
- **Database Persistence**: Saves notifications for all users (even if FCM fails)
- **Error Resilience**: Continues processing even if some users fail

**Error Responses:**

- `400 Bad Request`: Missing required fields or empty usernames list
- `500 Internal Server Error`: Server error during bulk processing

### 3. Get Personal Notifications

**GET** `/notify/getPersonalNoti`

Retrieve personal notifications with pagination and optional username filtering.

**Parameters:**

- `index` (query, optional): Page index (default: 0)
- `limit` (query, optional): Number of items per page (default: 10)
- `username` (query, optional): Filter by specific username

**Examples:**

- `/notify/getPersonalNoti` - Get all personal notifications (paginated)
- `/notify/getPersonalNoti?index=0&limit=5` - Get first 5 notifications
- `/notify/getPersonalNoti?username=john_doe` - Get notifications for specific user
- `/notify/getPersonalNoti?username=john_doe&index=1&limit=10` - Get user's notifications with pagination

**Response:**

```json
[
  {
    "id": 1,
    "userId": "john_doe",
    "username": "john_doe",
    "title": "Personal Message",
    "content": "This is a personal notification for you.",
    "createdAt": 1703123456789
  },
  {
    "id": 2,
    "userId": "jane_smith",
    "username": "jane_smith",
    "title": "Important Update",
    "content": "Your account has been updated.",
    "createdAt": 1703123456790
  }
]
```

## Personal Notification Entity Structure

The `PersionalNoti` entity contains:

- `id`: Unique identifier (Long)
- `userId`: User identifier (String)
- `username`: Username (String)
- `title`: Notification title (String)
- `content`: Notification content (String)
- `createdAt`: Creation timestamp (Long)

## Integration with FCM

### Prerequisites

- User must have registered an FCM token using `/notify/save-token`
- FCM token must be active and valid

### Notification Flow

1. **Validation**: Check if username, title, and content are provided
2. **Token Lookup**: Find FCM token for the specified username
3. **Database Save**: Store notification in `persional_noti` table
4. **FCM Send**: Send push notification via Firebase Cloud Messaging
5. **Response**: Return success/failure status

### Error Handling

- **No FCM Token**: Returns error if user hasn't registered a token
- **Invalid Token**: Firebase handles invalid/expired tokens gracefully
- **Database Errors**: Proper error logging and user feedback
- **Network Issues**: Timeout and retry handling

## Usage Examples

### Send Personal Notification

```bash
curl -X POST http://3.85.17.154:8080/notify/push-noti-persional \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "title": "Account Alert",
    "content": "Your account balance is low. Please add funds."
  }'
```

### Send Bulk Personal Notifications

```bash
curl -X POST http://3.85.17.154:8080/notify/push-noti-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "usernames": ["john_doe", "jane_smith", "alice_cooper"],
    "title": "System Update",
    "content": "New features have been added to your account. Check them out!"
  }'
```

### Get User's Personal Notifications

```bash
curl -X GET "http://3.85.17.154:8080/notify/getPersonalNoti?username=john_doe&limit=5"
```

### Get All Personal Notifications (Admin)

```bash
curl -X GET "http://3.85.17.154:8080/notify/getPersonalNoti?index=0&limit=20"
```

## Bulk Notification Features

### Performance Optimization

- **Firebase Multicast**: Uses Firebase's multicast messaging for efficient delivery to multiple devices
- **Batch Database Operations**: Optimized database writes for multiple notifications
- **Parallel Processing**: Processes user tokens concurrently where possible

### Error Handling & Resilience

- **Individual User Failures**: If one user fails, others continue processing
- **Token Validation**: Checks FCM token existence before processing
- **Detailed Error Reporting**: Returns specific information about failed users
- **Graceful Degradation**: Saves to database even if FCM delivery fails

### Response Structure

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

### Use Cases

- **System Announcements**: Notify all active users about maintenance or updates
- **Targeted Campaigns**: Send promotions to specific user segments
- **Emergency Alerts**: Quickly notify multiple users about urgent matters
- **Group Notifications**: Send messages to team members or groups

## Security Considerations

- **Authentication**: Ensure proper authentication before sending personal notifications
- **Authorization**: Verify sender has permission to send notifications to target user
- **Rate Limiting**: Implement rate limiting to prevent spam
- **Content Validation**: Sanitize notification content to prevent XSS
- **Privacy**: Personal notifications should only be accessible to the intended recipient

## Best Practices

1. **Meaningful Titles**: Use clear, descriptive titles
2. **Concise Content**: Keep notification content brief and actionable
3. **Timing**: Consider user's timezone and preferences
4. **Frequency**: Avoid overwhelming users with too many notifications
5. **Personalization**: Tailor content to the specific user when possible

## Related Endpoints

- `POST /notify/save-token` - Register FCM token for user
- `POST /notify/push-noti-persional` - Send notification to single user
- `POST /notify/push-noti-bulk` - Send notifications to multiple users
- `POST /notify/push-all` - Send notification to all users
- `GET /notify/getSysNoti` - Get system notifications
- `GET /notify/getTransferNoti` - Get transaction notifications
- `GET /notify/getPersonalNoti` - Get personal notifications with filtering
