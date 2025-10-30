export interface Poll {
  id: number;
  question: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePollDto {
  question: string;
  created_by: number;
}

export interface UpdatePollDto {
  question?: string;
  created_by?: number;
}

export interface PollOptionResult {
  id: number;
  text: string;
  vote_count: number;
}

export interface PollResults {
  id: number;
  question: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  options: PollOptionResult[];
  total_votes: number;
}
