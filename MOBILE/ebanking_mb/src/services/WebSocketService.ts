import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store';
import { addMessage, setConnected, setTypingStatus } from '../store/chatSlice';
import { HOST_SERVER } from '../constants/api';

class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;
  private messageListeners: Set<(message: any) => void> = new Set();

  /**
   * Connect to WebSocket server
   */
  connect(
    userId: string,
    serverUrl: string = `http://${HOST_SERVER}:8086`,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      console.log('🔌 [WebSocket] Connecting with userId:', userId);
      console.log('🔌 [WebSocket] Server URL:', serverUrl);

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
          console.log('✅ WebSocket connected for userId:', userId);
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

    console.log(
      '📡 [WebSocket] Subscribing to /user/queue/messages for userId:',
      this.userId,
    );

    // Subscribe to personal messages
    this.client.subscribe(`/user/queue/messages`, (message: IMessage) => {
      try {
        console.log(
          '🔵 [WebSocket] RAW message received from broker:',
          message,
        );
        const data = JSON.parse(message.body);
        console.log('📨 [WebSocket] Parsed message data:', {
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
        });

        // Dispatch to Redux store
        console.log('🔴 [WebSocket] Dispatching to Redux...');
        store.dispatch(addMessage(data));
        console.log('✅ [WebSocket] Dispatched to Redux successfully');

        // Notify all listeners (for components)
        console.log(
          '🔔 [WebSocket] Notifying listeners, count:',
          this.messageListeners.size,
        );
        this.notifyListeners(data);
        console.log('✅ [WebSocket] Listeners notified');
      } catch (error) {
        console.error('❌ [WebSocket] Error parsing message:', error);
      }
    });

    // Subscribe to notifications
    this.client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        console.log('🔔 Received notification:', data);

        // Dispatch to Redux store
        store.dispatch(addMessage(data));

        // Notify all listeners
        this.notifyListeners(data);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    // Subscribe to typing indicators
    this.client.subscribe(`/user/queue/typing`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        console.log('⌨️ Typing indicator:', data);

        // Update typing status in Redux
        store.dispatch(
          setTypingStatus({
            userId: data.senderId,
            isTyping: data.isTyping,
          }),
        );
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    });

    console.log(
      '✅ Subscribed to messages, notifications, and typing indicators',
    );
  }

  /**
   * Subscribe to new messages (for components)
   * Returns unsubscribe function
   */
  onMessage(callback: (message: any) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  /**
   * Notify all message listeners
   */
  private notifyListeners(message: any) {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
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
   * Send typing indicator
   */
  sendTypingIndicator(receiverId: string, isTyping: boolean) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected, cannot send typing indicator');
      return;
    }

    const indicator = {
      receiverId,
      isTyping,
    };

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(indicator),
    });

    console.log('⌨️ Typing indicator sent:', indicator);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      this.messageListeners.clear();
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
