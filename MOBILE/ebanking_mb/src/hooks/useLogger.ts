import { useTranslation } from 'react-i18next';

export const useLogger = () => {
    const { t } = useTranslation();

    const logTabChange = (from: string, to: string) => {
        console.log(t('mock_data.messages.tab_changed', { from, to }));
    };

    const logNotificationPress = () => {
        console.log(t('mock_data.messages.notification_pressed'));
    };

    const logActionPress = (action: string) => {
        console.log(t('mock_data.messages.action_pressed', { action }));
    };

    const logMenuSelect = (item: string, route: string, label: string) => {
        console.log(t('mock_data.messages.menu_item_selected', { item }));
        console.log(t('mock_data.messages.route', { route }));
        console.log(t('mock_data.messages.label', { label }));
    };

    const logSupportPress = () => {
        console.log(t('mock_data.messages.support_pressed'));
    };

    const logProfilePress = () => {
        console.log(t('mock_data.messages.profile_pressed'));
    };

    const logLogoutPress = () => {
        console.log(t('mock_data.messages.logout_pressed'));
    };

    const logNavigateToTab = (tab: string) => {
        console.log(t('mock_data.messages.navigate_to_tab', { tab }));
    };

    const logUnknownTab = (tab: string) => {
        console.log(t('mock_data.messages.unknown_tab', { tab }));
    };

    return {
        logTabChange,
        logNotificationPress,
        logActionPress,
        logMenuSelect,
        logSupportPress,
        logProfilePress,
        logLogoutPress,
        logNavigateToTab,
        logUnknownTab,
    };
};
