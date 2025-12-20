import { 
  getAllUsers, 
  getAllUsersAsSimple, 
  getUserById, 
  searchUsers, 
  getUsersWithPagination,
  type User, 
  type SimpleUser 
} from './userService';

// Re-export everything from userService for centralized access
export {
  getAllUsers,
  getAllUsersAsSimple,
  getUserById,
  searchUsers,
  getUsersWithPagination,
  type User,
  type SimpleUser
};

// Additional user management functions can be added here
export interface UserFilters {
  search?: string;
  isActive?: boolean;
  hasKyc?: boolean;
  gender?: 'male' | 'female' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface UserStats {
  total: number;
  active: number;
  kycVerified: number;
  male: number;
  female: number;
  recentRegistrations: number;
}

/**
 * Get filtered users based on various criteria
 */
export async function getFilteredUsers(filters: UserFilters): Promise<SimpleUser[]> {
  try {
    const users = await getAllUsers();
    
    let filteredUsers = users;
    
    // Apply search filter
    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const name = (user.fullName || user.username || '').toLowerCase();
        const email = user.email.toLowerCase();
        const phone = user.phone || '';
        const citizenId = user.citizenId || '';
        
        return name.includes(keyword) ||
               email.includes(keyword) ||
               phone.includes(filters.search!) ||
               citizenId.includes(filters.search!);
      });
    }
    
    // Apply gender filter
    if (filters.gender && filters.gender !== 'all') {
      filteredUsers = filteredUsers.filter(user => {
        return filters.gender === 'male' ? user.isMale : !user.isMale;
      });
    }
    
    // Apply KYC filter
    if (filters.hasKyc !== undefined) {
      filteredUsers = filteredUsers.filter(user => {
        const hasKyc = user.ekycStatus !== null && user.ekycVerifiedAt !== null;
        return filters.hasKyc ? hasKyc : !hasKyc;
      });
    }
    
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      filteredUsers = filteredUsers.filter(user => {
        const userDate = new Date(user.createAt);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (userDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          if (userDate > toDate) return false;
        }
        
        return true;
      });
    }
    
    return filteredUsers.map(user => ({
      id: user.id.toString(),
      name: user.fullName || user.username || user.email,
      email: user.email,
      phone: user.phone || '',
    }));
  } catch (error) {
    console.error('Failed to get filtered users:', error);
    throw new Error('Không thể lọc danh sách người dùng');
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const users = await getAllUsers();
    
    const total = users.length;
    const male = users.filter(user => user.isMale).length;
    const female = users.filter(user => !user.isMale).length;
    const kycVerified = users.filter(user => 
      user.ekycStatus !== null && user.ekycVerifiedAt !== null
    ).length;
    
    // Recent registrations (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = users.filter(user => 
      user.createAt > thirtyDaysAgo
    ).length;
    
    return {
      total,
      active: total, // Assuming all users are active since there's no active field
      kycVerified,
      male,
      female,
      recentRegistrations,
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    throw new Error('Không thể tải thống kê người dùng');
  }
}

/**
 * Get users sorted by various criteria
 */
export async function getSortedUsers(
  sortBy: 'name' | 'email' | 'createAt' | 'updatedAt' = 'createAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<SimpleUser[]> {
  try {
    const users = await getAllUsers();
    
    const sortedUsers = users.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.fullName || a.username || a.email).toLowerCase();
          bValue = (b.fullName || b.username || b.email).toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createAt':
          aValue = a.createAt;
          bValue = b.createAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.createAt;
          bValue = b.createAt;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sortedUsers.map(user => ({
      id: user.id.toString(),
      name: user.fullName || user.username || user.email,
      email: user.email,
      phone: user.phone || '',
    }));
  } catch (error) {
    console.error('Failed to get sorted users:', error);
    throw new Error('Không thể sắp xếp danh sách người dùng');
  }
}

/**
 * Export user data to CSV format
 */
export async function exportUsersToCSV(): Promise<string> {
  try {
    const users = await getAllUsers();
    
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Citizen ID',
      'Gender',
      'Address',
      'KYC Status',
      'Created At',
      'Updated At'
    ];
    
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.fullName || ''}"`,
        user.email,
        user.phone || '',
        user.citizenId,
        user.isMale ? 'Male' : 'Female',
        `"${user.address || ''}"`,
        user.ekycStatus || 'Not Verified',
        new Date(user.createAt).toISOString(),
        user.updatedAt ? new Date(user.updatedAt).toISOString() : ''
      ].join(','))
    ];
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Failed to export users to CSV:', error);
    throw new Error('Không thể xuất danh sách người dùng');
  }
}

// Export all types