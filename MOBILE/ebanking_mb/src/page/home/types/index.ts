import { ActionItemType } from '../components/QuickActions';
import { ServiceItemType } from '../components/ServicesGrid';

export interface HomeScreenState {
  notificationCount: number;
  isBalanceVisible: boolean;
  activeTab: string;
  requireUpdateInfo: boolean;
}

export interface NavigationTab {
  id: string;
  label: string;
  icon: string;
}

export { ActionItemType, ServiceItemType };
