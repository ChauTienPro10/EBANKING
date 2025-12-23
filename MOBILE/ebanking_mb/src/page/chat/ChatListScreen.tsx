import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setConversations, updateUnreadCount } from '../../store/chatSlice';
import ChatAPI from '../../services/ChatAPI';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import EmptyChatState from '../../components/chat/EmptyChatState';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { conversations, isConnected } = useSelector(
    (state: RootState) => state.chat,
  );
  const accountTransResponse = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Generate consistent color based on string
  const getAvatarColor = (text: string): string => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B739',
      '#52B788',
      '#FF8C94',
      '#A8DADC',
      '#E76F51',
      '#2A9D8F',
      '#E9C46A',
      '#F4A582',
      '#8E7CC3',
      '#6C5B7B',
      '#C06C84',
      '#F67280',
    ];

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
      loadUnreadCount();
    }, []),
  );

  const loadConversations = async () => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    try {
      setLoading(true);
      const data = await ChatAPI.getConversations(accountNumber);
      dispatch(setConversations(data));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    try {
      const count = await ChatAPI.getUnreadCount(accountNumber);
      dispatch(updateUnreadCount(count));
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadConversations(), loadUnreadCount()]);
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: any) => {
    (navigation as any).navigate('ChatConversation', {
      conversationId: conversation.id,
      otherUserId: conversation.otherUserId,
      otherUserName: conversation.otherUserName,
    });
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString('vi-VN');
  };

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: getAvatarColor(
              item.otherUserId || item.otherUserName || '?',
            ),
          },
        ]}
      >
        <Text style={styles.avatarText}>
          {item.otherUserName?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>
            {item.otherUserName || item.otherUserId}
          </Text>
          <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
        </View>

        <View style={styles.messagePreview}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 &&
                item.lastMessageSenderId !==
                  accountTransResponse?.accountNumber &&
                styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage
              ? item.lastMessageSenderId === accountTransResponse?.accountNumber
                ? `Bạn: ${item.lastMessage}`
                : item.lastMessage
              : 'Chưa có tin nhắn'}
          </Text>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <View
          style={[styles.connectionStatus, isConnected && styles.connected]}
        >
          <Text style={styles.connectionText}>
            {isConnected ? '● Online' : '○ Offline'}
          </Text>
        </View>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={
          conversations.length === 0 && styles.emptyContainer
        }
        ListEmptyComponent={<EmptyChatState onRefresh={onRefresh} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  connected: {
    backgroundColor: '#E8F5E9',
  },
  connectionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333333',
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ChatListScreen;
