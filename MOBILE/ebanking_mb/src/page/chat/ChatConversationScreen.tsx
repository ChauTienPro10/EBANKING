import React, { useEffect, useState, useRef } from 'react';
import {
  View,
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

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    loadMessages();
    markConversationAsRead();

    // Set custom header
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <ChatHeader
          otherUserName={otherUserName}
          otherUserId={otherUserId}
          isConnected={isConnected}
          onBackPress={() => navigation.goBack()}
        />
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

      <ChatInputBar
        inputText={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        sending={sending}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatConversationScreen;
