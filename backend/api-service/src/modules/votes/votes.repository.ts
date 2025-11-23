import pool from '../../shared/db';
import { Vote, CreateVoteDto, UpdateVoteDto } from './votes.types';
import AppError from '../../shared/errors/app-error';

class VotesRepository {
  async findAll(): Promise<Vote[]> {
    const result = await pool.query('SELECT * FROM votes ORDER BY id ASC');
    return result.rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
    }));
  }

  async findById(id: number): Promise<Vote> {
    const result = await pool.query('SELECT * FROM votes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Vote not found', 404);
    }

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
    };
  }

  async create(voteData: CreateVoteDto): Promise<Vote> {
    const { poll_option_id, user_id } = voteData;

    const result = await pool.query(
      'INSERT INTO votes (poll_option_id, user_id) VALUES ($1, $2) RETURNING *',
      [poll_option_id, user_id]
    );

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
    };
  }

  async update(id: number, voteData: UpdateVoteDto): Promise<Vote> {
    const { poll_option_id, user_id } = voteData;

    const result = await pool.query(
      'UPDATE votes SET poll_option_id=COALESCE($1, poll_option_id), user_id=COALESCE($2, user_id) WHERE id=$3 RETURNING *',
      [poll_option_id ?? null, user_id ?? null, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Vote not found', 404);
    }

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
    };
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM votes WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Vote not found', 404);
    }
  }

  async getPollIdByOptionId(pollOptionId: number): Promise<number> {
    const result = await pool.query(
      'SELECT poll_id FROM poll_options WHERE id = $1',
      [pollOptionId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Poll option not found', 404);
    }

    return result.rows[0].poll_id;
  }

  async findByUserIdAndPollId(
    userId: number,
    pollId: number
  ): Promise<Vote | null> {
    const result = await pool.query(
      `SELECT v.* FROM votes v
       INNER JOIN poll_options po ON v.poll_option_id = po.id
       WHERE v.user_id = $1 AND po.poll_id = $2
       LIMIT 1`,
      [userId, pollId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
    };
  }
}

export default new VotesRepository();
