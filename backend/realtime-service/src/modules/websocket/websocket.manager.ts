import { WebSocket, WebSocketServer } from 'ws';
import {
  WebSocketMessage,
  SubscribePayload,
  UnsubscribePayload,
  ErrorPayload,
  PollUpdateMessage,
  ClientConnection,
  SubscriptionMap,
} from './websocket.types';
import { PollResults } from '../polls/polls.types';
import logger from '../../shared/logger';

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientConnection> = new Map();
  private subscriptions: SubscriptionMap = {};

  initialize(wss: WebSocketServer): void {
    this.wss = wss;

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket connection established');

      // Initialize client connection
      const clientConnection: ClientConnection = {
        ws,
        subscribedPolls: new Set(),
      };
      this.clients.set(ws, clientConnection);

      ws.on('message', (data: Buffer) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', error => {
        logger.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, data: Buffer): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(ws, message.payload as SubscribePayload);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(ws, message.payload as UnsubscribePayload);
          break;
        default:
          this.sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message:', error as Error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  private handleSubscribe(ws: WebSocket, payload: SubscribePayload): void {
    const { poll_id } = payload;

    if (!poll_id || typeof poll_id !== 'number') {
      this.sendError(ws, 'Invalid poll_id');
      return;
    }

    // Add to client's subscribed polls
    const client = this.clients.get(ws);
    if (client) {
      client.subscribedPolls.add(poll_id);
    }

    // Add to subscriptions map
    if (!this.subscriptions[poll_id]) {
      this.subscriptions[poll_id] = new Set();
    }
    this.subscriptions[poll_id].add(ws);

    logger.info(`Client subscribed to poll ${poll_id}`);

    // Send confirmation
    const response: WebSocketMessage<SubscribePayload> = {
      type: 'subscribe',
      payload: { poll_id },
    };
    this.sendToClient(ws, response);
  }

  private handleUnsubscribe(ws: WebSocket, payload: UnsubscribePayload): void {
    const { poll_id } = payload;

    if (!poll_id || typeof poll_id !== 'number') {
      this.sendError(ws, 'Invalid poll_id');
      return;
    }

    // Remove from client's subscribed polls
    const client = this.clients.get(ws);
    if (client) {
      client.subscribedPolls.delete(poll_id);
    }

    // Remove from subscriptions map
    if (this.subscriptions[poll_id]) {
      this.subscriptions[poll_id].delete(ws);
      if (this.subscriptions[poll_id].size === 0) {
        delete this.subscriptions[poll_id];
      }
    }

    logger.info(`Client unsubscribed from poll ${poll_id}`);

    // Send confirmation
    const response: WebSocketMessage<UnsubscribePayload> = {
      type: 'unsubscribe',
      payload: { poll_id },
    };
    this.sendToClient(ws, response);
  }

  private handleDisconnect(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (client) {
      // Remove from all subscriptions
      client.subscribedPolls.forEach(pollId => {
        if (this.subscriptions[pollId]) {
          this.subscriptions[pollId].delete(ws);
          if (this.subscriptions[pollId].size === 0) {
            delete this.subscriptions[pollId];
          }
        }
      });

      this.clients.delete(ws);
      logger.info('Client disconnected');
    }
  }

  broadcastPollUpdate(pollId: number, results: PollResults): void {
    const subscribers = this.subscriptions[pollId];
    if (!subscribers || subscribers.size === 0) {
      logger.debug(`No subscribers for poll ${pollId}`);
      return;
    }

    const message: WebSocketMessage<PollUpdateMessage> = {
      type: 'poll_update',
      payload: {
        poll_id: pollId,
        results,
      },
    };

    let successCount = 0;
    let failCount = 0;

    subscribers.forEach(ws => {
      if (this.sendToClient(ws, message)) {
        successCount++;
      } else {
        failCount++;
      }
    });

    logger.info(
      `Broadcast poll ${pollId} update to ${successCount} clients (${failCount} failed)`
    );
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage): boolean {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error('Error sending message to client:', error as Error);
        return false;
      }
    }
    return false;
  }

  private sendError(ws: WebSocket, errorMessage: string): void {
    const message: WebSocketMessage<ErrorPayload> = {
      type: 'error',
      payload: { message: errorMessage },
    };
    this.sendToClient(ws, message);
  }

  getSubscriberCount(pollId: number): number {
    return this.subscriptions[pollId]?.size || 0;
  }

  getTotalConnections(): number {
    return this.clients.size;
  }
}

export default new WebSocketManager();
