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
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  currentConversationId: null,
  isConnected: false,
  unreadCount: 0,
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

      // Initialize messages array if not exists
      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // Add message if not already exists
      const exists = state.messages[convId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[convId].push(message);

        // Sort by createdAt
        state.messages[convId].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      }

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
} = chatSlice.actions;

export default chatSlice.reducer;
