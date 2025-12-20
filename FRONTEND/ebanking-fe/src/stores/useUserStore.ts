import { create } from "zustand";
import { getAllUsersAsSimple, searchUsers, type SimpleUser } from "@/services/userService";

interface UserStore {
  // State
  users: SimpleUser[];
  filteredUsers: SimpleUser[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  loadUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // Computed
  getUserById: (id: string) => SimpleUser | undefined;
  getUsersCount: () => number;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  filteredUsers: [],
  loading: false,
  error: null,
  searchQuery: "",
  
  // Actions
  loadUsers: async () => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Loading users...');
      const users = await getAllUsersAsSimple();
      console.log('UserStore: Users loaded:', users.length, users);
      set({ 
        users, 
        filteredUsers: users, 
        loading: false 
      });
    } catch (error: any) {
      console.error('UserStore: Failed to load users:', error);
      set({ 
        error: error.message || 'Failed to load users', 
        loading: false,
        users: [],
        filteredUsers: []
      });
    }
  },
  
  searchUsers: async (query: string) => {
    set({ loading: true, error: null, searchQuery: query });
    try {
      if (!query.trim()) {
        // If no query, show all users
        const { users } = get();
        set({ filteredUsers: users, loading: false });
        return;
      }
      
      console.log('UserStore: Searching users with query:', query);
      const filteredUsers = await searchUsers(query);
      console.log('UserStore: Search results:', filteredUsers.length, filteredUsers);
      set({ filteredUsers, loading: false });
    } catch (error: any) {
      console.error('UserStore: Failed to search users:', error);
      set({ 
        error: error.message || 'Failed to search users', 
        loading: false,
        filteredUsers: []
      });
    }
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    // Don't auto-search here to avoid re-renders that cause input focus loss
    // The component should call searchUsers separately
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Computed functions
  getUserById: (id: string) => {
    const { users } = get();
    return users.find(user => user.id === id);
  },
  
  getUsersCount: () => {
    const { users } = get();
    return users.length;
  },
}));