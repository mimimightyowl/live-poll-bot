export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  telegram_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  full_name?: string | null;
  telegram_id?: string | null;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  full_name?: string | null;
  telegram_id?: string | null;
}
