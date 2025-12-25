import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: 'TEXT' | 'TRANSACTION_NOTIFICATION';
  content: string;
  transactionId?: number;
  metadata?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  currentConversationId: string | null;
  isConnected: boolean;
  unreadCount: number;
  typingStatus: Record<string, boolean>; // userId -> isTyping
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  currentConversationId: null,
  isConnected: false,
  unreadCount: 0,
  typingStatus: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const message = action.payload;
      const convId = message.conversationId;

      console.log('🔴 [Redux] addMessage called:', {
        convId,
        messageId: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
      });

      // Get current messages or empty array
      const currentMessages = state.messages[convId] || [];
      console.log('🔴 [Redux] Current messages count:', currentMessages.length);

      // Check if this is a real message replacing a temp message
      const isTempMessage = String(message.id).startsWith('temp-');

      if (!isTempMessage) {
        // This is a REAL message from backend
        // Check if we have a temp message with same content that should be replaced
        const tempMessageIndex = currentMessages.findIndex(
          m =>
            String(m.id).startsWith('temp-') &&
            m.content === message.content &&
            m.senderId === message.senderId &&
            m.receiverId === message.receiverId,
        );

        if (tempMessageIndex !== -1) {
          console.log('🔄 [Redux] Replacing temp message with real message');
          // Replace temp message with real one
          const newMessages = [...currentMessages];
          newMessages[tempMessageIndex] = message;
          state.messages[convId] = newMessages;

          // Update conversation
          const conversation = state.conversations.find(c => c.id === convId);
          if (conversation) {
            conversation.lastMessage = message.content;
            conversation.lastMessageTime = message.createdAt;
          }
          return;
        }
      }

      // Check if message already exists (by ID)
      const exists = currentMessages.some(m => m.id === message.id);
      console.log('🔴 [Redux] Message exists?', exists);

      if (!exists) {
        // Create NEW array reference to trigger React re-render
        const newMessages = [...currentMessages, message];

        // Sort by createdAt
        newMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        // Assign new array (this creates new reference)
        state.messages[convId] = newMessages;
        console.log('✅ [Redux] Message added! New count:', newMessages.length);

        // Update unread count
        if (!message.isRead && message.receiverId !== message.senderId) {
          state.unreadCount += 1;
        }

        // Update conversation last message
        const conversation = state.conversations.find(c => c.id === convId);
        if (conversation) {
          conversation.lastMessage = message.content;
          conversation.lastMessageTime = message.createdAt;
          if (!message.isRead) {
            conversation.unreadCount += 1;
          }
        }
      } else {
        console.log('⚠️ [Redux] Message already exists, skipping');
      }
    },

    setMessages: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: ChatMessage[];
      }>,
    ) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },

    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload.sort((a, b) => {
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        return timeB - timeA;
      });
    },

    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const messages = state.messages[conversationId];

      if (messages) {
        messages.forEach(message => {
          if (!message.isRead) {
            message.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      }

      const conversation = state.conversations.find(
        c => c.id === conversationId,
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    setTypingStatus: (
      state,
      action: PayloadAction<{ userId: string; isTyping: boolean }>,
    ) => {
      const { userId, isTyping } = action.payload;
      state.typingStatus[userId] = isTyping;
    },

    markMessageAsRead: (
      state,
      action: PayloadAction<{ messageId: number; conversationId: number }>,
    ) => {
      const { messageId, conversationId } = action.payload;
      console.log('✓✓ [Redux] Marking message as read:', {
        messageId,
        conversationId,
      });

      const messages = state.messages[conversationId];
      if (!messages) {
        console.warn('⚠️ [Redux] No messages found for conversation');
        return;
      }

      // Convert both to string for comparison since message.id can be string or number
      const messageIndex = messages.findIndex(
        m => String(m.id) === String(messageId),
      );

      if (messageIndex === -1) {
        console.warn('⚠️ [Redux] Message not found:', messageId);
        return;
      }

      if (messages[messageIndex].isRead) {
        console.log('ℹ️ [Redux] Message already read');
        return;
      }

      // CRITICAL: Create new array to force reference change
      const updatedMessages = messages.map((msg, idx) =>
        idx === messageIndex ? { ...msg, isRead: true } : msg,
      );
      state.messages[conversationId] = updatedMessages;

      console.log('✅ [Redux] Created new array, reference changed');
    },

    updateConversationLastMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage: string;
        lastMessageTime: string;
      }>,
    ) => {
      const { conversationId, lastMessage, lastMessageTime } = action.payload;
      const conversation = state.conversations.find(
        c => c.id === conversationId,
      );
      if (conversation) {
        conversation.lastMessage = lastMessage;
        conversation.lastMessageTime = lastMessageTime;

        // Re-sort conversations by last message time
        state.conversations.sort((a, b) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return timeB - timeA;
        });
      }
    },
  },
});

export const {
  setConnected,
  addMessage,
  setMessages,
  setConversations,
  setCurrentConversation,
  markAsRead,
  updateUnreadCount,
  setTypingStatus,
  markMessageAsRead,
  updateConversationLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
