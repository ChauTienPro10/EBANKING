import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store';
import { addMessage, setConnected } from '../store/chatSlice';
import { HOST_SERVER } from '../constants/api';

class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(
    userId: string,
    serverUrl: string = `http://${HOST_SERVER}:8086`,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${serverUrl}/ws-chat`),
        connectHeaders: {
          'X-User-Id': userId,
        },
        debug: str => {
          console.log('[WebSocket Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          store.dispatch(setConnected(true));
          this.subscribeToMessages();
          resolve();
        },
        onStompError: frame => {
          console.error('❌ WebSocket STOMP error:', frame.headers['message']);
          store.dispatch(setConnected(false));
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          store.dispatch(setConnected(false));
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          store.dispatch(setConnected(false));
        },
      });

      this.client.activate();
    });
  }

  /**
   * Subscribe to user's message queue
   */
  private subscribeToMessages() {
    if (!this.client || !this.userId) {
      console.error('Cannot subscribe: client or userId is null');
      return;
    }

    // Subscribe to personal messages
    this.client.subscribe(`/user/queue/messages`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        console.log('📨 Received message:', data);
        store.dispatch(addMessage(data));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Subscribe to notifications
    this.client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        console.log('🔔 Received notification:', data);
        store.dispatch(addMessage(data));
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    console.log('✅ Subscribed to messages and notifications');
  }

  /**
   * Send a message
   */
  sendMessage(receiverId: string, content: string) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      receiverId,
      content,
    };

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });

    console.log('📤 Message sent:', message);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      store.dispatch(setConnected(false));
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export default new WebSocketService();
