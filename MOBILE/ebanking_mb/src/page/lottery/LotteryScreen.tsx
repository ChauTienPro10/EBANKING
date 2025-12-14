import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components';
import Colors from '../../constants/color';
import { API } from '../../constants/api';
import fetch from '../../utils/fetch';

const { width } = Dimensions.get('window');

const LotteryScreen: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'mb' | 'mt' | 'mn'>('mb');
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = API.GET_XOSO_MIENBAC;
            switch (activeTab) {
                case 'mb':
                    url = API.GET_XOSO_MIENBAC;
                    break;
                case 'mt':
                    url = API.GET_XOSO_MIENTRUNG;
                    break;
                case 'mn':
                    url = API.GET_XOSO_MIENNAM;
                    break;
            }

            const response = await fetch.get(url, {}, true);
            const html = await response.text();
            setHtmlContent(html);
        } catch (error) {
            console.error('Error fetching lottery data:', error);
            setHtmlContent('<h1 style="text-align:center; margin-top: 50px;">Không thể tải dữ liệu</h1>');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'mb', label: t('lottery.north') || 'Miền Bắc' },
        { id: 'mt', label: t('lottery.central') || 'Miền Trung' },
        { id: 'mn', label: t('lottery.south') || 'Miền Nam' },
    ];

    return (
        <View style={styles.container}>
            <Header title={t('home.lottery_king') || 'Vua Xổ Số'} showBackButton={true} />

            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.id as 'mb' | 'mt' | 'mn')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.id && styles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.webViewContainer}>
                <WebView
                    source={{ html: htmlContent }}
                    style={styles.webView}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    originWhitelist={['*']}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        marginHorizontal: 4,
        backgroundColor: Colors.grey2,
    },
    activeTab: {
        backgroundColor: Colors.main_bule,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
    webViewContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
    },
});

export default LotteryScreen;
