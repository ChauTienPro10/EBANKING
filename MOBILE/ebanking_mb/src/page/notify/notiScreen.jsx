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
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationCount } from '../../store/slices/appSlice';
import { Header, GText } from '../../components';
import Colors from '../../constants/color';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

const NotiScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const notificationCount = useSelector(state => state.app.notificationCount);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'system'
  const [notificationsSystem, setNotificationsSystem] = useState([]);
  const [notificationsPersonal, setNotificationsPersonal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (activeTab === 'system') {
        await getNotiSystem(index);
      } else {
        await getNotiPersonal(index);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotiSystem = async (index = 0) => {
    try {
      const response = await fetch.get(
        API.GET_NOTIFICATIONSYSTEM,
        { index, limit: 10 },
        true, // authRequire
      );

      // Handle different response structures
      let notifications = [];
      if (Array.isArray(response)) {
        notifications = response;
      } else if (response?.data && Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response?.data) {
        notifications = [response.data];
      }

      console.log('System notifications loaded:', notifications.length);
      setNotificationsSystem(notifications);

      // Update notification count based on unread notifications
      updateNotificationCount(notificationsPersonal, notifications);
    } catch (error) {
      console.error('Error loading system notifications:', error);
      setNotificationsSystem([]);
    }
  };

  const getNotiPersonal = async (index = 0) => {
    try {
      const response = await fetch.get(
        API.GET_NOTIFICATIONPERSONAL,
        { index, limit: 10 },
        true, // authRequire
      );

      // Handle different response structures
      let notifications = [];
      if (Array.isArray(response)) {
        notifications = response;
      } else if (response?.data && Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response?.data) {
        notifications = [response.data];
      }

      console.log('Personal notifications loaded:', notifications.length);
      setNotificationsPersonal(notifications);

      // Update notification count based on unread notifications
      updateNotificationCount(notifications, notificationsSystem);
    } catch (error) {
      console.error('Error loading personal notifications:', error);
      setNotificationsPersonal([]);
    }
  };

  const updateNotificationCount = (personal, system) => {
    const unreadPersonal = personal.filter(n => !n.read).length;
    const unreadSystem = system.filter(n => !n.read).length;
    const totalUnread = unreadPersonal + unreadSystem;
    dispatch(setNotificationCount(totalUnread));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async notification => {
    // Mark as read if not read
    if (!notification.read) {
      try {
        // TODO: Call API to mark as read
        // await fetch.post(API.MARK_NOTIFICATION_READ, { id: notification.id }, true);

        // Update local state
        if (activeTab === 'system') {
          setNotificationsSystem(prev =>
            prev.map(item =>
              item.id === notification.id ? { ...item, read: true } : item,
            ),
          );
        } else {
          setNotificationsPersonal(prev =>
            prev.map(item =>
              item.id === notification.id ? { ...item, read: true } : item,
            ),
          );
        }

        // Decrease notification count in Redux
        if (notificationCount > 0) {
          dispatch(setNotificationCount(notificationCount - 1));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // TODO: Navigate to notification detail if needed
  };

  const formatTime = timestamp => {
    if (!timestamp) return '';

    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diff = now - notificationDate;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    if (minutes < 1) {
      return t('notifications.time_ago_minutes', { minutes: 1 });
    } else if (minutes < 60) {
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
          {activeTab === 'personal' && <View style={styles.tabIndicator} />}
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
          {activeTab === 'system' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={
          activeTab === 'system' ? notificationsSystem : notificationsPersonal
        }
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={[
          styles.listContainer,
          (activeTab === 'system' ? notificationsSystem : notificationsPersonal)
            .length === 0 && styles.listContainerEmpty,
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
