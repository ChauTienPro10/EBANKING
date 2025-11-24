import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const useAppNavigation = (initialTab: string = 'home') => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId: string) => {
    console.log(
      t('mock_data.messages.tab_changed', { from: activeTab, to: tabId }),
    );
    setActiveTab(tabId);

    switch (tabId) {
      case 'home':
        navigation.navigate('Home' as never);
        break;
      case 'card':
        navigation.navigate('Card' as never);
        break;
      case 'search':
        navigation.navigate('Search' as never);
        break;
      case 'settings':
        navigation.navigate('Settings' as never);
        break;
      case 'support':
        navigation.navigate('Support' as never);
        break;
      default:
        console.log(t('mock_data.messages.unknown_tab', { tab: tabId }));
    }
  };

  const handleNotificationPress = () => {
    console.log(t('mock_data.messages.notification_pressed'));
  };

  const handleActionPress = (action: any) => {
    console.log(
      t('mock_data.messages.action_pressed', {
        action: action.title || action,
      }),
    );
  };

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    handleNotificationPress,
    handleActionPress,
  };
};
