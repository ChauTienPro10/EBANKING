import { Conversation, ChatMessage } from '../store/chatSlice';
import { HOST_SERVER } from '../constants/api';

const BASE_URL = `http://${HOST_SERVER}:8086/api/chat`;

export interface GetMessagesParams {
  conversationId: string;
  page?: number;
  size?: number;
}

export interface SendMessageParams {
  receiverId: string;
  content: string;
}

class ChatAPI {
  /**
   * Get all conversations for current user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    params: GetMessagesParams,
    userId: string,
  ): Promise<{ content: ChatMessage[]; totalPages: number }> {
    try {
      const { conversationId, page = 0, size = 20 } = params;
      const url = `${BASE_URL}/conversations/${conversationId}/messages?page=${page}&size=${size}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    params: SendMessageParams,
    userId: string,
  ): Promise<ChatMessage> {
    try {
      const response = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: {
            'X-User-Id': userId,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${BASE_URL}/unread-count`, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }
}

export default new ChatAPI();
