import pool from '../../shared/db';
import { User, CreateUserDto, UpdateUserDto } from './users.types';
import AppError from '../../shared/errors/app-error';

class UsersRepository {
  async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return result.rows;
  }

  async findById(id: number): Promise<User> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  async findByTelegramId(telegramId: string): Promise<User> {
    const result = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  async create(userData: CreateUserDto): Promise<User> {
    const { username, email, telegram_id, full_name } = userData;

    const result = await pool.query(
      'INSERT INTO users (username, email, telegram_id, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, telegram_id || null, full_name || null]
    );

    return result.rows[0];
  }

  async update(id: number, userData: UpdateUserDto): Promise<User> {
    const { username, email, telegram_id, full_name } = userData;

    if (!username || !email) {
      throw new AppError('Username and email are required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET username=$1, email=$2, telegram_id=$3, full_name=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [username, email, telegram_id || null, full_name || null, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }
  }
}

export default new UsersRepository();
