import { WebSocket } from 'ws';
import { PollResults } from '../polls/polls.types';

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: 'poll_update' | 'subscribe' | 'unsubscribe' | 'error';
  payload: T;
}

export interface SubscribePayload {
  poll_id: number;
}

export interface UnsubscribePayload {
  poll_id: number;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export interface PollUpdateMessage {
  poll_id: number;
  results: PollResults;
}

// Client connection tracking
export interface ClientConnection {
  ws: WebSocket;
  subscribedPolls: Set<number>;
}

export interface SubscriptionMap {
  [pollId: number]: Set<WebSocket>;
}
