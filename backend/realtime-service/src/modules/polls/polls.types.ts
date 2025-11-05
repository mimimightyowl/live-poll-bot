// Poll types
export interface Poll {
  id: number;
  question: string;
  created_by: number;
  created_at: string | Date;
  updated_at: string | Date;
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
  created_at: string | Date;
  updated_at: string | Date;
  options: PollOptionResult[];
  total_votes: number;
}
