import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Colors from '../../../constants/color';
import { ActionItemType, ServiceItemType, NavigationTab } from '../types';

export const useHomeData = () => {
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
        color: Colors.orange,
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
        color: Colors.purple,
        tag: null,
      },
      {
        id: 'suspicious',
        title: t('action_grid.suspicious_transactions'),
        icon: 'alert-circle',
        color: '#FF3B30',
        tag: null,
      },
      {
        id: 'withdraw',
        title: t('action_grid.withdraw'),
        icon: 'cash',
        color: Colors.main_green,
        tag: null,
      },
      {
        id: 'mobile_prepaid',
        title: t('action_grid.mobile_prepaid'),
        icon: 'mobile',
        color: Colors.purple,
        tag: null,
      },
    ],
    [t],
  );

  const services: ServiceItemType[] = useMemo(
    () => [
      {
        id: 'lottery',
        title: t('home.lottery_king'),
        icon: 'game-controller',
        color: Colors.orange,
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
        color: Colors.purple,
      },
      {
        id: 'flight',
        title: t('home.flight_tickets'),
        icon: 'airplane',
        color: Colors.main_green,
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
