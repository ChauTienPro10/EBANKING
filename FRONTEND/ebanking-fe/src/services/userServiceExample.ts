// Example usage of the new user service
import { 
  getAllUsers, 
  getAllUsersAsSimple, 
  getUserById, 
  searchUsers,
  getUsersWithPagination 
} from './userService';

import { 
  getFilteredUsers, 
  getUserStats, 
  getSortedUsers,
  exportUsersToCSV 
} from './userManagementService';

// Example 1: Basic user loading
export async function loadAllUsers() {
  try {
    console.log('Loading all users...');
    const users = await getAllUsers();
    console.log(`Loaded ${users.length} users:`, users);
    return users;
  } catch (error) {
    console.error('Failed to load users:', error);
    throw error;
  }
}

// Example 2: Load users for notifications
export async function loadUsersForNotifications() {
  try {
    console.log('Loading users for notifications...');
    const simpleUsers = await getAllUsersAsSimple();
    console.log(`Loaded ${simpleUsers.length} simple users:`, simpleUsers);
    return simpleUsers;
  } catch (error) {
    console.error('Failed to load users for notifications:', error);
    throw error;
  }
}

// Example 3: Search users
export async function searchForUsers(keyword: string) {
  try {
    console.log(`Searching users with keyword: "${keyword}"`);
    const results = await searchUsers(keyword);
    console.log(`Found ${results.length} users:`, results);
    return results;
  } catch (error) {
    console.error('Failed to search users:', error);
    throw error;
  }
}

// Example 4: Get user by ID
export async function loadUserById(id: string) {
  try {
    console.log(`Loading user with ID: ${id}`);
    const user = await getUserById(id);
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found');
    }
    return user;
  } catch (error) {
    console.error('Failed to load user by ID:', error);
    throw error;
  }
}

// Example 5: Paginated users
export async function loadPaginatedUsers(page: number = 1, limit: number = 10) {
  try {
    console.log(`Loading page ${page} with ${limit} users per page`);
    const result = await getUsersWithPagination(page, limit);
    console.log(`Page ${result.page}/${result.totalPages}:`, result.users);
    console.log(`Total users: ${result.total}`);
    return result;
  } catch (error) {
    console.error('Failed to load paginated users:', error);
    throw error;
  }
}

// Example 6: Filtered users
export async function loadFilteredUsers() {
  try {
    console.log('Loading filtered users...');
    
    // Filter for male users with KYC
    const maleKycUsers = await getFilteredUsers({
      gender: 'male',
      hasKyc: true
    });
    console.log(`Male KYC users: ${maleKycUsers.length}`);
    
    // Search for users with specific keyword
    const searchResults = await getFilteredUsers({
      search: 'gmail'
    });
    console.log(`Users with "gmail": ${searchResults.length}`);
    
    return { maleKycUsers, searchResults };
  } catch (error) {
    console.error('Failed to load filtered users:', error);
    throw error;
  }
}

// Example 7: User statistics
export async function loadUserStatistics() {
  try {
    console.log('Loading user statistics...');
    const stats = await getUserStats();
    console.log('User Statistics:', {
      'Total Users': stats.total,
      'Active Users': stats.active,
      'KYC Verified': stats.kycVerified,
      'Male Users': stats.male,
      'Female Users': stats.female,
      'Recent Registrations (30 days)': stats.recentRegistrations
    });
    return stats;
  } catch (error) {
    console.error('Failed to load user statistics:', error);
    throw error;
  }
}

// Example 8: Sorted users
export async function loadSortedUsers() {
  try {
    console.log('Loading sorted users...');
    
    // Sort by name ascending
    const byName = await getSortedUsers('name', 'asc');
    console.log('Users sorted by name (A-Z):', byName.slice(0, 5)); // Show first 5
    
    // Sort by creation date descending (newest first)
    const byDate = await getSortedUsers('createAt', 'desc');
    console.log('Newest users:', byDate.slice(0, 5)); // Show first 5
    
    return { byName, byDate };
  } catch (error) {
    console.error('Failed to load sorted users:', error);
    throw error;
  }
}

// Example 9: Export users to CSV
export async function exportUsers() {
  try {
    console.log('Exporting users to CSV...');
    const csvData = await exportUsersToCSV();
    
    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('CSV export completed');
    return csvData;
  } catch (error) {
    console.error('Failed to export users:', error);
    throw error;
  }
}

// Example 10: Complete user management workflow
export async function userManagementWorkflow() {
  try {
    console.log('=== User Management Workflow ===');
    
    // 1. Load statistics
    const stats = await loadUserStatistics();
    
    // 2. Load recent users (first page)
    const recentUsers = await loadPaginatedUsers(1, 5);
    
    // 3. Search for specific users
    const searchResults = await searchForUsers('gmail');
    
    // 4. Get filtered users
    const kycUsers = await getFilteredUsers({ hasKyc: true });
    
    console.log('Workflow Summary:', {
      totalUsers: stats.total,
      recentUsersLoaded: recentUsers.users.length,
      searchResultsFound: searchResults.length,
      kycVerifiedUsers: kycUsers.length
    });
    
    return {
      stats,
      recentUsers: recentUsers.users,
      searchResults,
      kycUsers
    };
  } catch (error) {
    console.error('User management workflow failed:', error);
    throw error;
  }
}

// Usage in React component:
/*
import { useEffect, useState } from 'react';
import { loadUsersForNotifications, loadUserStatistics } from '@/services/userServiceExample';

function UserManagementComponent() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [usersData, statsData] = await Promise.all([
          loadUsersForNotifications(),
          loadUserStatistics()
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>User Management</h2>
      <div>Total Users: {stats?.total}</div>
      <div>KYC Verified: {stats?.kycVerified}</div>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
*/