import pool from '../../shared/db';
import { Poll, CreatePollDto, UpdatePollDto } from './polls.types';
import AppError from '../../shared/errors/app-error';

class PollsRepository {
  async findAll(): Promise<Poll[]> {
    const result = await pool.query('SELECT * FROM polls ORDER BY id ASC');
    return result.rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));
  }

  async findById(id: number): Promise<Poll> {
    const result = await pool.query('SELECT * FROM polls WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Poll not found', 404);
    }

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async create(pollData: CreatePollDto): Promise<Poll> {
    const { question, created_by } = pollData;

    const result = await pool.query(
      'INSERT INTO polls (question, created_by) VALUES ($1, $2) RETURNING *',
      [question, created_by]
    );

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async update(id: number, pollData: UpdatePollDto): Promise<Poll> {
    const { question, created_by } = pollData;

    const result = await pool.query(
      'UPDATE polls SET question=COALESCE($1, question), created_by=COALESCE($2, created_by), updated_at=NOW() WHERE id=$3 RETURNING *',
      [question ?? null, created_by ?? null, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Poll not found', 404);
    }

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM polls WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Poll not found', 404);
    }
  }
}

export default new PollsRepository();
