import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
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

// Import components
import MessageBubble from './components/MessageBubble';
import TransactionMessageBubble from './components/TransactionMessageBubble';
import ChatHeader from './components/ChatHeader';
import ChatInputBar from './components/ChatInputBar';
import EmptyState from './components/EmptyState';
import QuickActionsBar from './components/QuickActionsBar';
import PaymentReminderModal from './components/PaymentReminderModal';
import QuickGiftModal from './components/QuickGiftModal';

// Import utilities
import {
  isFirstInGroup,
  isLastInGroup,
  hasReplied,
} from './utils/messageUtils';

// Import styles
import { chatStyles } from './styles/chatStyles';

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
  const isOtherUserTyping = useSelector(
    (state: RootState) => state.chat.typingStatus[otherUserId] || false,
  );

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [deliveredMessageIds, setDeliveredMessageIds] = useState<
    Set<string | number>
  >(new Set());
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPaymentReminderModal, setShowPaymentReminderModal] =
    useState(false);
  const [showQuickGiftModal, setShowQuickGiftModal] = useState(false);

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    loadMessages();

    // Set custom header
    navigation.setOptions({
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#09a0a5',
      },
      headerTintColor: '#FFFFFF',
      headerLeft: () => (
        <ChatHeader
          otherUserName={otherUserName}
          otherUserId={otherUserId}
          isConnected={isConnected}
          onBackPress={() => navigation.goBack()}
        />
      ),
    });
  }, [conversationId, otherUserName, otherUserId, isConnected, navigation]);

  // Mark messages as read when accountTransResponse is ready
  useEffect(() => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    ChatAPI.markAsRead(conversationId, accountNumber)
      .then(() => {
        dispatch(markAsRead(conversationId));
      })
      .catch(error => {
        console.error('Error marking messages as read:', error);
      });
  }, [accountTransResponse?.accountNumber, conversationId, dispatch]);

  // Use ref to track current conversation ID to avoid listener cleanup race condition
  const currentConversationRef = useRef(conversationId);
  const currentOtherUserRef = useRef(otherUserId);

  // Update refs when conversation changes
  useEffect(() => {
    currentConversationRef.current = conversationId;
    currentOtherUserRef.current = otherUserId;
  }, [conversationId, otherUserId]);

  // Listen to WebSocket messages for real-time updates
  // Setup once on mount to avoid race condition where cleanup happens during message receive
  useEffect(() => {
    console.log('🔌 Setting up WebSocket listener');

    const unsubscribe = WebSocketService.onMessage(newMessage => {
      const currentConvId = currentConversationRef.current;
      const currentOtherUser = currentOtherUserRef.current;

      console.log('📨 WebSocket message received:', {
        messageConvId: newMessage.conversationId,
        currentConvId,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        content: newMessage.content,
      });

      // Check if message belongs to current conversation
      const messageConvId = String(newMessage.conversationId);
      const convId = String(currentConvId);

      const belongsToConversation =
        messageConvId === convId ||
        newMessage.senderId === currentOtherUser ||
        newMessage.receiverId === currentOtherUser;

      if (belongsToConversation) {
        console.log(
          '✅ Message belongs to current conversation, scrolling to bottom',
        );

        // Scroll to bottom to show new message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.log('❌ Message does NOT belong to current conversation');
      }
    });

    return () => {
      console.log('🔌 Cleaning up WebSocket listener');
      unsubscribe();
    };
  }, []); // Empty deps - setup once, use refs for current values

  useEffect(() => {
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

  // Scroll to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Send typing indicator when user is typing
  useEffect(() => {
    let typingTimeout: ReturnType<typeof setTimeout>;

    if (inputText.length > 0 && isConnected) {
      // Send typing indicator
      WebSocketService.sendTypingIndicator(otherUserId, true);

      // Auto-stop typing after 3 seconds of no input
      typingTimeout = setTimeout(() => {
        WebSocketService.sendTypingIndicator(otherUserId, false);
      }, 3000);
    } else if (inputText.length === 0 && isConnected) {
      // User cleared input, stop typing
      WebSocketService.sendTypingIndicator(otherUserId, false);
    }

    return () => {
      clearTimeout(typingTimeout);
      if (isConnected) {
        WebSocketService.sendTypingIndicator(otherUserId, false);
      }
    };
  }, [inputText, otherUserId, isConnected]);

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
    console.log('📖 [MarkAsRead] Attempting to mark conversation as read:', {
      conversationId,
      accountNumber,
      hasAccountNumber: !!accountNumber,
    });

    if (!accountNumber) {
      console.warn('⚠️ [MarkAsRead] No account number, skipping');
      return;
    }

    try {
      console.log('📡 [MarkAsRead] Calling API...');
      await ChatAPI.markAsRead(conversationId, accountNumber);
      console.log('✅ [MarkAsRead] API call successful');
      dispatch(markAsRead(conversationId));
      console.log('✅ [MarkAsRead] Redux updated');
    } catch (error) {
      console.error('❌ [MarkAsRead] Error:', error);
    }
  };

  const handleTransferAction = () => {
    // Navigate to Transfer screen with pre-filled recipient info
    (navigation as any).navigate('Transfer', {
      receiver: otherUserId,
      recipientAccount: otherUserId,
      recipientName: otherUserName,
    });
  };

  const handlePaymentReminderSend = async (amount: string, message: string) => {
    const accountNumber = accountTransResponse?.accountNumber;
    if (!accountNumber) return;

    // Format amount with thousand separators
    const formattedAmount = parseInt(amount, 10).toLocaleString('vi-VN');
    const reminderMessage = `💰 Nhắc trả tiền: ${formattedAmount}đ\n${message}`;

    try {
      setSending(true);
      if (isConnected) {
        WebSocketService.sendMessage(otherUserId, reminderMessage);

        // Optimistic update
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          senderId: accountNumber,
          receiverId: otherUserId,
          content: reminderMessage,
          createdAt: new Date().toISOString(),
          conversationId: conversationId,
          messageType: 'TEXT' as const,
          isRead: false,
        };
        dispatch(addMessage(optimisticMessage));
        setTimeout(() => {
          setDeliveredMessageIds(prev =>
            new Set(prev).add(optimisticMessage.id),
          );
        }, 500);
      } else {
        // Fallback to HTTP
        const message = await ChatAPI.sendMessage(
          { receiverId: otherUserId, content: reminderMessage },
          accountNumber,
        );
        dispatch(addMessage(message));
        setDeliveredMessageIds(prev => new Set(prev).add(message.id));
      }
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickGiftSend = (gift: any) => {
    // Navigate to Transfer screen with pre-filled gift info
    const giftContent = `🎁 Tặng quà: ${gift.emoji} ${gift.name}`;

    (navigation as any).navigate('Transfer', {
      receiver: otherUserId,
      recipientAccount: otherUserId,
      recipientName: otherUserName,
      amount: gift.price.toString(),
      content: giftContent,
    });
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

        // Optimistic UI update - add message immediately for instant feedback
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

        // Mark as delivered after short delay
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
          otherUserName={otherUserName}
        />
      );
    }

    // Check if this is first message in group (show avatar)
    const nextMessageForGroup = index > 0 ? messages[index - 1] : null;
    const isFirst = isFirstInGroup(item, nextMessageForGroup);

    // Check if this is last message in group (show seen status)
    const prevMessageForSeen =
      index < messages.length - 1 ? messages[index + 1] : null;
    const isLast = isLastInGroup(item, prevMessageForSeen);

    // Check if recipient has replied (hide seen status)
    const replied = hasReplied(messages, index, accountNumber || '');

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMyMessage}
        isSystemMessage={isSystemMessage}
        isFirstInGroup={isFirst}
        isLastInGroup={isLast}
        hasReplied={replied}
        otherUserId={otherUserId}
        otherUserName={otherUserName}
        deliveredMessageIds={deliveredMessageIds}
        selectedMessageId={selectedMessageId}
        onMessagePress={setSelectedMessageId}
      />
    );
  };

  if (loading) {
    return (
      <View style={chatStyles.centerContainer}>
        <ActivityIndicator size="large" color="#09a0a5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={chatStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={chatStyles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          <View style={{ height: keyboardVisible ? 10 : 10 }} />
        }
      />

      {isOtherUserTyping && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: '#F0F0F0',
          }}
        >
          <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
            {otherUserName} đang nhập...
          </Text>
        </View>
      )}

      <QuickActionsBar
        onTransferPress={handleTransferAction}
        onPaymentReminderPress={() => setShowPaymentReminderModal(true)}
        onQuickGiftPress={() => setShowQuickGiftModal(true)}
      />

      <ChatInputBar
        inputText={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        sending={sending}
      />

      <PaymentReminderModal
        visible={showPaymentReminderModal}
        onClose={() => setShowPaymentReminderModal(false)}
        onSend={handlePaymentReminderSend}
      />

      <QuickGiftModal
        visible={showQuickGiftModal}
        onClose={() => setShowQuickGiftModal(false)}
        onSend={handleQuickGiftSend}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatConversationScreen;
