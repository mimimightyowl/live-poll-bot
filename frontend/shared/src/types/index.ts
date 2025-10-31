// Base types
export interface Poll {
  id: number;
  question: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePollDto {
  question: string;
  created_by: number;
}

export interface UpdatePollDto {
  question?: string;
  created_by?: number;
}

export interface PollOption {
  id: number;
  poll_id: number;
  text: string;
}

export interface CreatePollOptionDto {
  poll_id: number;
  text: string;
}

export interface Vote {
  id: number;
  poll_option_id: number;
  user_id: number;
  created_at: string;
}

export interface CreateVoteDto {
  poll_option_id: number;
  user_id: number;
}

export interface UpdateVoteDto {
  poll_option_id?: number;
  user_id?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Results types
export interface PollOptionResult {
  id: number;
  text: string;
  vote_count: number;
}

export interface PollResults {
  id: number;
  question: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  options: PollOptionResult[];
  total_votes: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
}

export interface PollUpdateMessage {
  poll_id: number;
  results: PollResults;
}
