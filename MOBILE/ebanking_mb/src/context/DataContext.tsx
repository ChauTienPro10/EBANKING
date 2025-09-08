import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, DataService, User, Account, QuickAction, Service, MenuItem, SupportOption, SearchResult, Notification } from '../types/data';

interface DataContextType {
  state: AppState;
  dataService: DataService;
  // Actions
  setUser: (user: User | null) => void;
  setAccounts: (accounts: Account[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLanguage: (language: string) => void;
  // Data getters
  getQuickActions: () => Promise<QuickAction[]>;
  getServices: () => Promise<Service[]>;
  getMenuItems: () => Promise<MenuItem[]>;
  getSupportOptions: () => Promise<SupportOption[]>;
  search: (query: string) => Promise<SearchResult[]>;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  dataService: DataService;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, dataService }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    accounts: [],
    notifications: [],
    isAuthenticated: false,
    currentLanguage: 'vi',
  });

  // initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [user, accounts, notifications] = await Promise.all([
          dataService.getUser(),
          dataService.getAccounts(),
          dataService.getNotifications(),
        ]);

        setState(prev => ({
          ...prev,
          user,
          accounts,
          notifications,
        }));
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, [dataService]);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const setAccounts = (accounts: Account[]) => {
    setState(prev => ({ ...prev, accounts }));
  };

  const setNotifications = (notifications: Notification[]) => {
    setState(prev => ({ ...prev, notifications }));
  };

  const setAuthenticated = (authenticated: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: authenticated }));
  };

  const setLanguage = (language: string) => {
    setState(prev => ({ ...prev, currentLanguage: language }));
  };

  const getQuickActions = async () => {
    return await dataService.getQuickActions();
  };

  const getServices = async () => {
    return await dataService.getServices();
  };

  const getMenuItems = async () => {
    return await dataService.getMenuItems();
  };

  const getSupportOptions = async () => {
    return await dataService.getSupportOptions();
  };

  const search = async (query: string) => {
    return await dataService.search(query);
  };

  const authenticate = async (pin: string) => {
    const result = await dataService.authenticate(pin);
    setAuthenticated(result);
    return result;
  };

  const logout = async () => {
    await dataService.logout();
    setAuthenticated(false);
  };

  const value: DataContextType = {
    state,
    dataService,
    setUser,
    setAccounts,
    setNotifications,
    setAuthenticated,
    setLanguage,
    getQuickActions,
    getServices,
    getMenuItems,
    getSupportOptions,
    search,
    authenticate,
    logout,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
