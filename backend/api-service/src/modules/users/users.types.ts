export interface User {
  id: number;
  username: string;
  email: string;
  telegram_id: string | null;
  full_name: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface CreateUserDto {
  username: string;
  email: string;
  telegram_id?: string | null;
  full_name?: string | null;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  telegram_id?: string | null;
  full_name?: string | null;
}
