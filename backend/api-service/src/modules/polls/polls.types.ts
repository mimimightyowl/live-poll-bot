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
