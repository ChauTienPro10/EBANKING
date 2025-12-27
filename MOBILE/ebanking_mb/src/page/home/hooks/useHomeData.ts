import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Colors from '../../../constants/color';
import { ActionItemType, ServiceItemType, NavigationTab } from '../types';

export const useHomeData = (unreadCount: number = 0) => {
  const { t } = useTranslation();

  const quickActions: ActionItemType[] = useMemo(
    () => [
      {
        id: 'transfer',
        title: t('action_grid.transfer'),
        icon: 'transfer',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'trans_history',
        title: t('action_grid.pay_history'),
        icon: 'receipt',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'profile',
        title: t('action_grid.profile'),
        icon: 'person',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'statistics',
        title: t('action_grid.statistics'),
        icon: 'bar-chart',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'savings',
        title: t('action_grid.savings'),
        icon: 'dollar-sign',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'suspicious',
        title: t('action_grid.suspicious_transactions'),
        icon: 'alert-circle',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'spending_management',
        title: t('action_grid.spending_management'),
        icon: 'pie-chart',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'mobile_prepaid',
        title: t('action_grid.mobile_prepaid'),
        icon: 'mobile',
        color: Colors.main_bule,
        tag: null,
      },
      {
        id: 'chat',
        title: t('action_grid.chat'),
        icon: 'chatbubbles',
        color: Colors.main_bule,
        tag: unreadCount > 0 ? unreadCount.toString() : null,
      },
    ],
    [t, unreadCount],
  );

  const services: ServiceItemType[] = useMemo(
    () => [
      {
        id: 'lottery',
        title: t('home.lottery_king'),
        icon: 'game-controller',
        color: Colors.main_bule,
      },
      {
        id: 'data',
        title: t('home.data_4g'),
        icon: 'wifi',
        color: Colors.main_bule,
      },
      {
        id: 'game',
        title: t('home.game_card'),
        icon: 'game-controller',
        color: Colors.main_bule,
      },
      {
        id: 'flight',
        title: t('home.flight_tickets'),
        icon: 'airplane',
        color: Colors.main_bule,
      },
    ],
    [t],
  );

  const bottomTabs: NavigationTab[] = useMemo(
    () => [
      { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
      { id: 'card', label: t('bottom_navigation.card'), icon: 'card' },
      {
        id: 'settings',
        label: t('bottom_navigation.settings'),
        icon: 'settings',
      },
      {
        id: 'support',
        label: t('bottom_navigation.support'),
        icon: 'help-circle',
      },
    ],
    [t],
  );

  return {
    quickActions,
    services,
    bottomTabs,
  };
};
