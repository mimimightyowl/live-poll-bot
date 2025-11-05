import pool from '../../shared/db';
import { PollResults, PollOptionResult } from './polls.types';
import AppError from '../../shared/errors/app-error';
import logger from '../../shared/logger';

class PollsRepository {
  async getPollResults(id: number): Promise<PollResults | null> {
    try {
      const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [
        id,
      ]);

      if (pollResult.rows.length === 0) {
        return null;
      }

      const poll = pollResult.rows[0];

      const optionsResult = await pool.query(
        `SELECT 
          po.id,
          po.text,
          COUNT(v.id)::int AS vote_count
        FROM poll_options po
        LEFT JOIN votes v ON po.id = v.poll_option_id
        WHERE po.poll_id = $1
        GROUP BY po.id, po.text
        ORDER BY po.id ASC`,
        [id]
      );

      const options: PollOptionResult[] = optionsResult.rows;
      const totalVotes = options.reduce(
        (sum, option) => sum + option.vote_count,
        0
      );

      return {
        id: poll.id,
        question: poll.question,
        created_by: poll.created_by,
        created_at: poll.created_at,
        updated_at: poll.updated_at,
        options,
        total_votes: totalVotes,
      };
    } catch (error) {
      logger.error('Error fetching poll results:', error as Error);
      throw error;
    }
  }
}

export default new PollsRepository();
