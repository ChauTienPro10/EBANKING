import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useCommonUI = () => {
    const { t } = useTranslation();
    const [notificationCount, setNotificationCount] = useState(3);

    const showLogoutAlert = (onConfirm: () => void) => {
        Alert.alert(
            t('menu.logout'),
            t('mock_data.messages.logout_confirm'),
            [
                {
                    text: t('mock_data.messages.cancel'),
                    style: 'cancel',
                    onPress: () => console.log(t('mock_data.messages.logout_cancelled'))
                },
                {
                    text: t('menu.logout'),
                    style: 'destructive',
                    onPress: onConfirm
                },
            ]
        );
    };

    const showSupportAlert = () => {
        Alert.alert(t('support.title'), t('mock_data.messages.support_connecting'));
    };

    const showNavigationAlert = (label: string) => {
        Alert.alert(t('mock_data.messages.navigation'), `${t('mock_data.messages.navigation')} ${label}`);
    };

    const clearNotifications = () => {
        setNotificationCount(0);
    };

    const incrementNotifications = () => {
        setNotificationCount(prev => prev + 1);
    };

    return {
        notificationCount,
        setNotificationCount,
        showLogoutAlert,
        showSupportAlert,
        showNavigationAlert,
        clearNotifications,
        incrementNotifications,
    };
};
