import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header, GText } from '../../components';
import Colors from '../../constants/color';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

const NotiScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'system'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch.get(API.GET_NOTIFICATIONS, { type: activeTab }, true);
      // setNotifications(response.data || []);
      
      // Mock data for now
      const mockData = getMockNotifications(activeTab);
      setNotifications(mockData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = (type) => {
    if (type === 'personal') {
      return [
        {
          id: '1',
          title: 'Chuyển tiền thành công',
          message: 'Bạn đã chuyển 500,000 VND đến tài khoản ****1234',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          type: 'personal',
        },
        {
          id: '2',
          title: 'Nhận tiền từ người gửi',
          message: 'Bạn đã nhận 1,000,000 VND từ Nguyễn Văn A',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          type: 'personal',
        },
        {
          id: '3',
          title: 'Thanh toán hóa đơn điện',
          message: 'Thanh toán hóa đơn điện tháng 12/2024 thành công',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          type: 'personal',
        },
        {
          id: '4',
          title: 'Nạp tiền điện thoại',
          message: 'Nạp 50,000 VND cho số điện thoại 0901234567 thành công',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          type: 'personal',
        },
      ];
    } else {
      return [
        {
          id: '5',
          title: 'Bảo trì hệ thống',
          message: 'Hệ thống sẽ được bảo trì từ 02:00 - 04:00 ngày 25/12/2024',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          read: false,
          type: 'system',
        },
        {
          id: '6',
          title: 'Cập nhật tính năng mới',
          message: 'Ứng dụng đã được cập nhật với nhiều tính năng mới. Hãy cập nhật ngay!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: false,
          type: 'system',
        },
        {
          id: '7',
          title: 'Thông báo khuyến mãi',
          message: 'Chương trình khuyến mãi đặc biệt dành cho khách hàng. Xem ngay!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: true,
          type: 'system',
        },
        {
          id: '8',
          title: 'Thay đổi điều khoản sử dụng',
          message: 'Chúng tôi đã cập nhật điều khoản sử dụng. Vui lòng xem lại.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          read: true,
          type: 'system',
        },
      ];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read if not read
    if (!notification.read) {
      try {
        // TODO: Call API to mark as read
        // await fetch.post(API.MARK_NOTIFICATION_READ, { id: notification.id }, true);
        
        // Update local state
        setNotifications(prev =>
          prev.map(item =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // TODO: Navigate to notification detail if needed
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    if (minutes < 60) {
      return t('notifications.time_ago_minutes', { minutes });
    } else if (hours < 24) {
      return t('notifications.time_ago_hours', { hours });
    } else {
      return t('notifications.time_ago_days', { days });
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.notificationItemUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <GText
              type="systemBold_16"
              color={!item.read ? Colors.textPrimary : Colors.textSecondary}
              style={styles.notificationTitle}
            >
              {item.title}
            </GText>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <GText
            type="systemLight_14"
            color={Colors.textSecondary}
            style={styles.notificationMessage}
            numberOfLines={2}
          >
            {item.message}
          </GText>
          <GText
            type="systemLight_12"
            color={Colors.grey3}
            style={styles.notificationTime}
          >
            {formatTime(item.timestamp)}
          </GText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <GText
          type="systemLight_16"
          color={Colors.grey3}
          style={styles.emptyStateText}
        >
          {t('notifications.no_notifications')}
        </GText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('notifications.title')} showBackButton={true} />

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
          onPress={() => setActiveTab('personal')}
          activeOpacity={0.7}
        >
          <GText
            type="systemBold_16"
            color={
              activeTab === 'personal' ? Colors.main_bule : Colors.textSecondary
            }
          >
            {t('notifications.tab_personal')}
          </GText>
          {activeTab === 'personal' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'system' && styles.tabActive]}
          onPress={() => setActiveTab('system')}
          activeOpacity={0.7}
        >
          <GText
            type="systemBold_16"
            color={
              activeTab === 'system' ? Colors.main_bule : Colors.textSecondary
            }
          >
            {t('notifications.tab_system')}
          </GText>
          {activeTab === 'system' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.main_bule]}
            tintColor={Colors.main_bule}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active tab styling
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.main_bule,
    borderRadius: 2,
  },
  listContainer: {
    paddingVertical: 8,
  },
  listContainerEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#F0F9FF',
    borderLeftColor: Colors.main_bule,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.main_bule,
  },
  notificationMessage: {
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});

export default NotiScreen;

