export interface Vote {
  id: number;
  poll_option_id: number;
  user_id: number;
  created_at: Date;
}

export interface CreateVoteDto {
  poll_option_id: number;
  user_id: number;
}

export interface UpdateVoteDto {
  poll_option_id?: number;
  user_id?: number;
}
