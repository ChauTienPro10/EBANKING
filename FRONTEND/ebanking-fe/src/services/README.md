# Services Documentation

## User Service

The user service has been refactored to use the `GET_ALL_USER` endpoint with proper response structure handling.

## Account Service

The account service has been created to replace mock data and use real API endpoints.

### API Response Structure

The API returns data in this format:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 402,
      "fullName": null,
      "citizenId": "087298879898",
      "birthday": 0,
      "email": "t1@gmail.com",
      "phone": null,
      "isMale": false,
      "address": null,
      "createAt": 1765546464767,
      "updatedAt": 0,
      "userId": 402,
      "username": "t1@gmail.com",
      "ekycSessionId": null,
      "ekycStatus": null,
      "ekycVerifiedAt": null,
      "avatarPath": null,
      "faceAuthEnabled": false,
      "dailyTransactionLimit": 50000000.00
    }
  ]
}
```

### Usage Examples

#### Basic Usage

```typescript
import { getAllUsers, getAllUsersAsSimple, getUserById } from '@/services/userService';

// Get all users with full data
const users = await getAllUsers();

// Get users in SimpleUser format (for notifications, etc.)
const simpleUsers = await getAllUsersAsSimple();

// Get specific user by ID
const user = await getUserById('402');
```

#### Advanced Usage

```typescript
import { 
  getFilteredUsers, 
  getUserStats, 
  getSortedUsers,
  getUsersWithPagination 
} from '@/services/userManagementService';

// Get filtered users
const filteredUsers = await getFilteredUsers({
  search: 'john',
  gender: 'male',
  hasKyc: true
});

// Get user statistics
const stats = await getUserStats();

// Get paginated users
const paginatedResult = await getUsersWithPagination(1, 10, 'search term');

// Get sorted users
const sortedUsers = await getSortedUsers('name', 'asc');
```

### Migration Guide

The following functions have been updated to use the new API structure:

1. **notificationService.listUsers()** - Now uses `getAllUsersAsSimple()` internally
2. **fetchHelpers.api.users.getAllUsers()** - New method for the wrapped response
3. **All user-related components** - Should continue working without changes

### Backward Compatibility

All existing code using `SimpleUser` interface will continue to work. The new service automatically converts the full `User` objects to `SimpleUser` format when needed.

### Error Handling

All user service functions include proper error handling and will throw descriptive error messages in Vietnamese when operations fail.

### Types

- `User` - Full user object from API
- `SimpleUser` - Simplified user object for UI components
- `UserFilters` - Filter options for user queries
- `UserStats` - User statistics object

### Account Service Usage

#### API Response Structure

The API returns data in this format:
```json
{
  "success": true,
  "message": "Accounts retrieved successfully",
  "data": [
    {
      "id": "ACC001",
      "customerId": "402",
      "type": "Savings",
      "balance": 1000000,
      "currency": "VND",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Basic Usage

```typescript
import { getAllAccounts, getEnrichedAccounts, getAccountById } from '@/services/accountService';

// Get all accounts with basic data
const accounts = await getAllAccounts();

// Get accounts enriched with user information
const enrichedAccounts = await getEnrichedAccounts();

// Get specific account by ID
const account = await getAccountById('ACC001');
```

#### Advanced Usage

```typescript
import { 
  filterAccounts, 
  paginateAccounts, 
  getAccountStats,
  lockAccount,
  unlockAccount 
} from '@/services/accountService';

// Filter accounts
const filteredAccounts = filterAccounts(accounts, {
  search: 'john',
  status: 'Active'
});

// Get paginated accounts
const paginatedResult = paginateAccounts(accounts, 1, 10);

// Get account statistics
const stats = await getAccountStats();

// Lock/unlock accounts (if API supports it)
await lockAccount('ACC001', 'fraud', '2024-12-31T23:59:59Z');
await unlockAccount('ACC001');
```

### Migration from Mock Data

The following changes have been made:

1. **AccountsPage** - Now uses real API data instead of mock
2. **useAccountStore** - Updated to use new account service
3. **All account components** - Continue working without changes due to same interface
4. **Debug tools** - Added for testing and troubleshooting

### Testing

#### From UI:
- Go to Accounts page
- Click "Debug Accounts" tab
- Click test buttons to see results

#### From Console:
```javascript
// Open Developer Tools (F12) and run:
testAccountService()
```

### Error Handling

All account service functions include proper error handling and will throw descriptive error messages in Vietnamese when operations fail.

### Data Enrichment

The service automatically enriches account data with user information:
- `ownerName` - User's full name, username, or email
- `ownerEmail` - User's email address
- `ownerPhone` - User's phone number

This is done by matching `account.customerId` with `user.id` or `user.userId`.