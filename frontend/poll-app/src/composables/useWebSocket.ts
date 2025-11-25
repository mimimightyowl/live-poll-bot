import { ref, onUnmounted } from 'vue';
import type {
  PollResults,
  WebSocketMessage,
  PollUpdateMessage,
} from '@shared/types';
import { getWebSocketUrl } from '@/utils/getWebSocketUrl';

interface UseWebSocketOptions {
  pollId?: number;
  onUpdate?: (results: PollResults) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { pollId, onUpdate, onError, reconnectInterval = 3000 } = options;

  const isConnected = ref(false);
  const isReconnecting = ref(false);
  const error = ref<string | null>(null);
  let ws: WebSocket | null = null;
  let reconnectTimer: number | null = null;

  const connect = () => {
    try {
      const wsUrl = getWebSocketUrl();
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnected.value = true;
        isReconnecting.value = false;
        error.value = null;

        if (pollId) {
          subscribe(pollId);
        }
      };

      ws.onmessage = event => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = event => {
        console.error('WebSocket error:', event);
        error.value = 'WebSocket connection error';
        if (onError) {
          onError(event);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        isConnected.value = false;

        if (!isReconnecting.value) {
          scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      error.value = 'Failed to create WebSocket connection';
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) {
      return;
    }

    isReconnecting.value = true;
    console.log(`Reconnecting in ${reconnectInterval}ms...`);

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectInterval);
  };

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) {
      ws.close();
      ws = null;
    }

    isConnected.value = false;
    isReconnecting.value = false;
  };

  const subscribe = (pollId: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'subscribe',
      payload: { poll_id: pollId },
    };

    ws.send(JSON.stringify(message));
    console.log('Subscribed to poll:', pollId);
  };

  const unsubscribe = (pollId: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WebSocketMessage = {
      type: 'unsubscribe',
      payload: { poll_id: pollId },
    };

    ws.send(JSON.stringify(message));
    console.log('Unsubscribed from poll:', pollId);
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'poll_update': {
        const updateMessage = message.payload as PollUpdateMessage;
        if (onUpdate && updateMessage.results) {
          onUpdate(updateMessage.results);
        }
        break;
      }
      case 'subscribe':
        console.log('Subscribed to poll:', message.payload.poll_id);
        break;
      case 'unsubscribe':
        console.log('Unsubscribed from poll:', message.payload.poll_id);
        break;
      case 'error':
        console.error('WebSocket error message:', message.payload);
        error.value = message.payload.message || 'Unknown error';
        break;
      default:
        console.log('Received message:', message);
    }
  };

  const send = (message: WebSocketMessage) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    ws.send(JSON.stringify(message));
  };

  connect();

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    isReconnecting,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };
}
