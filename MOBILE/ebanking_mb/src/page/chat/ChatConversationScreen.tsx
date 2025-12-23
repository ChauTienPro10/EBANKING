import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setMessages,
  addMessage,
  markAsRead,
  setCurrentConversation,
} from '../../store/chatSlice';
import ChatAPI from '../../services/ChatAPI';
import WebSocketService from '../../services/WebSocketService';
import { useRoute, useNavigation } from '@react-navigation/native';

const ChatConversationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);

  const { conversationId, otherUserId, otherUserName } = route.params as any;

  const messages = useSelector(
    (state: RootState) => state.chat.messages[conversationId] || [],
  );
  const accountTransResponse = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  const isConnected = useSelector((state: RootState) => state.chat.isConnected);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [deliveredMessageIds, setDeliveredMessageIds] = useState<
    Set<string | number>
  >(new Set());

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    loadMessages();
    markConversationAsRead();

    // Set custom header
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#00BCD4',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text
              style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            >
              {otherUserName
                ? otherUserName.charAt(0).toUpperCase()
                : otherUserId.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#212121' }}>
              {otherUserName || otherUserId}
            </Text>
            <Text style={{ fontSize: 12, color: '#757575' }}>
              {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
      ),
    });

    return () => {
      dispatch(setCurrentConversation(null));
    };
  }, [conversationId, otherUserName, otherUserId, isConnected, navigation]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const loadMessages = async () => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    try {
      setLoading(true);
      const data = await ChatAPI.getMessages(
        { conversationId, page: 0, size: 50 },
        accountNumber,
      );
      dispatch(setMessages({ conversationId, messages: data.content }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    try {
      await ChatAPI.markAsRead(conversationId, accountNumber);
      dispatch(markAsRead(conversationId));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSend = async () => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!inputText.trim() || !accountNumber) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      setSending(true);

      if (isConnected) {
        // Send via WebSocket
        WebSocketService.sendMessage(otherUserId, messageText);

        // Optimistic UI update - add message to store immediately
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          senderId: accountNumber,
          receiverId: otherUserId,
          content: messageText,
          createdAt: new Date().toISOString(),
          conversationId: conversationId,
          messageType: 'TEXT' as const,
          isRead: false,
        };
        dispatch(addMessage(optimisticMessage));

        // Simulate delivery after 500ms for visual feedback
        setTimeout(() => {
          setDeliveredMessageIds(prev =>
            new Set(prev).add(optimisticMessage.id),
          );
        }, 500);
      } else {
        // Fallback to HTTP
        const message = await ChatAPI.sendMessage(
          { receiverId: otherUserId, content: messageText },
          accountNumber,
        );
        dispatch(addMessage(message));
        // Mark as delivered immediately for HTTP
        setDeliveredMessageIds(prev => new Set(prev).add(message.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const accountNumber = accountTransResponse?.accountNumber;
    const isMyMessage = item.senderId === accountNumber;
    const isSystemMessage = item.senderId === 'SYSTEM';

    if (item.messageType === 'TRANSACTION_NOTIFICATION') {
      return (
        <TransactionMessageBubble
          message={item}
          index={index}
          messages={messages}
        />
      );
    }

    // Check if this is first message in group (show avatar)
    // Messages are sorted DESC, so check NEXT message (index-1) which appears ABOVE on screen
    const nextMessageForGroup = index > 0 ? messages[index - 1] : null;
    const TIME_GAP_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

    let isFirstInGroup = true;
    if (nextMessageForGroup && nextMessageForGroup.senderId === item.senderId) {
      // Same sender - check time gap
      const timeDiff = Math.abs(
        new Date(item.createdAt).getTime() -
          new Date(nextMessageForGroup.createdAt).getTime(),
      );
      isFirstInGroup = timeDiff > TIME_GAP_THRESHOLD;
    }

    // Check if this is last message in group (show seen status)
    // Messages are sorted DESC, so check PREVIOUS message (index+1) which appears BELOW on screen
    const prevMessageForSeen =
      index < messages.length - 1 ? messages[index + 1] : null;
    const isLastInGroup =
      !prevMessageForSeen || prevMessageForSeen.senderId !== item.senderId;

    // Check if recipient has replied (hide seen status)
    const hasReplied =
      isMyMessage &&
      prevMessageForSeen &&
      prevMessageForSeen.senderId !== accountNumber;

    // Get avatar text for other user (left side avatar)
    const getAvatarText = () => {
      if (item.senderId === otherUserId) {
        return otherUserName
          ? otherUserName.charAt(0).toUpperCase()
          : otherUserId.charAt(0).toUpperCase();
      }
      return '?';
    };

    // Get avatar text for recipient (seen indicator)
    const getRecipientAvatarText = () => {
      return otherUserName
        ? otherUserName.charAt(0).toUpperCase()
        : otherUserId.charAt(0).toUpperCase();
    };

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        {/* Avatar or spacer for other user messages */}
        {!isMyMessage &&
          (isFirstInGroup ? (
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{getAvatarText()}</Text>
            </View>
          ) : (
            <View style={styles.avatarSpacer} />
          ))}

        {/* Message bubble with tap to show timestamp */}
        <View>
          {/* Bubble and indicator in flex row - indicator aligns with bubble bottom */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setSelectedMessageId(
                  selectedMessageId === item.id ? null : item.id,
                )
              }
              style={[
                styles.messageBubble,
                { maxWidth: Dimensions.get('window').width * 0.75 },
                isMyMessage ? styles.myMessage : styles.otherMessage,
                isSystemMessage && styles.systemMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMyMessage && styles.myMessageText,
                ]}
              >
                {item.content}
              </Text>
            </TouchableOpacity>

            {/* Seen status indicator for my messages - aligned with bubble bottom */}
            {isMyMessage && isLastInGroup && !hasReplied && (
              <View style={styles.seenIndicator}>
                {item.isRead ? (
                  // STATE 3: SEEN - Show recipient avatar
                  <View style={styles.seenAvatar}>
                    <Text style={styles.seenAvatarText}>
                      {getRecipientAvatarText()}
                    </Text>
                  </View>
                ) : deliveredMessageIds.has(item.id) ? (
                  // STATE 2: DELIVERED - Filled circle with white checkmark
                  <View style={styles.deliveredIndicator}>
                    <Text style={styles.deliveredCheckmark}>✓</Text>
                  </View>
                ) : (
                  // STATE 1: SENT - White circle with colored checkmark
                  <View style={styles.sentIndicator}>
                    <Text style={styles.sentCheckmark}>✓</Text>
                  </View>
                )}
              </View>
            )}

            {/* Invisible spacer for alignment when indicator is not shown */}
            {isMyMessage && (!isLastInGroup || hasReplied) && (
              <View style={{ width: 20 }} />
            )}
          </View>

          {/* Timestamp - show below bubble when selected */}
          {selectedMessageId === item.id && (
            <Text
              style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#09a0a5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
            <Text style={styles.emptySubtext}>Bắt đầu cuộc trò chuyện!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>{sending ? '...' : '➤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Transaction Message Bubble Component
const TransactionMessageBubble = ({
  message,
  index,
  messages,
}: {
  message: any;
  index: number;
  messages: any[];
}) => {
  const metadata = message.metadata ? JSON.parse(message.metadata) : {};
  const isReceive = metadata.type === 'RECEIVE';

  // Check if this is first message in group (show avatar)
  // Messages are sorted DESC, so check NEXT message (index-1) which appears ABOVE on screen
  const nextMessage = index > 0 ? messages[index - 1] : null;
  const TIME_GAP_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  let isFirstInGroup = true;
  if (nextMessage && nextMessage.senderId === message.senderId) {
    // Same sender - check time gap
    const timeDiff = Math.abs(
      new Date(message.createdAt).getTime() -
        new Date(nextMessage.createdAt).getTime(),
    );
    isFirstInGroup = timeDiff > TIME_GAP_THRESHOLD;
  }

  // Get avatar text
  const getAvatarText = () => {
    if (isReceive) {
      const name = metadata.senderName || metadata.senderAccountNumber;
      return name ? name.charAt(0).toUpperCase() : 'U';
    } else {
      const name = metadata.receiverName || metadata.receiverAccountNumber;
      return name ? name.charAt(0).toUpperCase() : 'U';
    }
  };

  return (
    <View
      style={[
        styles.messageRow,
        isReceive ? styles.otherMessageRow : styles.myMessageRow,
      ]}
    >
      {/* Avatar or spacer for received transactions */}
      {isReceive &&
        (isFirstInGroup ? (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>{getAvatarText()}</Text>
          </View>
        ) : (
          <View style={styles.avatarSpacer} />
        ))}

      {/* Transaction Card */}
      <View
        style={[
          styles.transactionBubble,
          {
            backgroundColor: isReceive ? '#E8F5E9' : '#FFEBEE',
          },
        ]}
      >
        {/* Header with badge and time */}
        <View style={styles.transactionHeader}>
          <View
            style={[
              styles.transactionBadge,
              { backgroundColor: isReceive ? '#4CAF50' : '#F44336' },
            ]}
          >
            <Text style={styles.badgeText}>
              {isReceive ? 'Đã nhận' : 'Đã gửi'}
            </Text>
          </View>
          <Text style={styles.transactionTime}>
            {new Date(message.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Amount */}
        <Text style={styles.transactionAmount}>
          {metadata.amount?.toLocaleString('vi-VN')}đ
        </Text>

        {/* Message content */}
        {metadata.message && (
          <Text style={styles.transactionDescription}>{metadata.message}</Text>
        )}

        {/* From/To user info */}
        {(isReceive ? metadata.senderName : metadata.receiverName) && (
          <Text style={styles.transactionUser}>
            {isReceive
              ? `Từ: ${metadata.senderName || metadata.senderAccountNumber}`
              : `Đến: ${
                  metadata.receiverName || metadata.receiverAccountNumber
                }`}
          </Text>
        )}
      </View>

      {/* Directional arrow indicator */}
      <View style={styles.seenIndicator}>
        <Text style={[styles.sentCheckmark, { fontSize: 16 }]}>
          {isReceive ? '↓' : '↑'}
        </Text>
      </View>
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
  messageList: {
    padding: 8,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarSpacer: {
    width: 40,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 8,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#09a0a5',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    flexWrap: 'wrap',
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#999999',
  },
  myMessageTime: {
    textAlign: 'left',
  },
  otherMessageTime: {
    textAlign: 'left',
  },
  seenIndicator: {
    marginLeft: 6,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  // STATE 1: SENT - White circle with colored checkmark
  sentIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentCheckmark: {
    fontSize: 6,
    color: '#09a0a5',
    fontWeight: 'bold',
  },
  // STATE 2: DELIVERED - Filled circle with white checkmark
  deliveredIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredCheckmark: {
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // STATE 3: SEEN - Recipient avatar
  seenAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seenAvatarText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
  },

  transactionBubble: {
    width: 260,
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextReceive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeTextSend: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  transactionAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 6,
  },
  transactionUser: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 6,
  },
  transactionBalance: {
    fontSize: 13,
    color: '#757575',
  },
  transactionTime: {
    fontSize: 11,
    color: '#9E9E9E',
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
});

export default ChatConversationScreen;
