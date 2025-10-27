import express, { Request, Response, NextFunction } from 'express';
import pool from '../db';
import AppError from '../errors/AppError';
import validate from '../middlewares/validate';
import {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
} from '../validation/users.schema';

const router = express.Router();

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  telegram_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// GET /api/users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [
        id,
      ]);
      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/users
router.post(
  '/',
  validate({ body: createUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, full_name, telegram_id } = req.body;

      const result = await pool.query(
        'INSERT INTO users (username, email, full_name, telegram_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, full_name || null, telegram_id || null]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'User created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/users/:id
router.put(
  '/:id',
  validate({ params: paramsSchema, body: updateUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { username, email, full_name, telegram_id } = req.body;
      if (!username || !email) {
        throw new AppError('Username and email are required', 400);
      }

      const result = await pool.query(
        'UPDATE users SET username=$1, email=$2, full_name=$3, telegram_id=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
        [username, email, full_name || null, telegram_id || null, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'User updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id
router.delete(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM users WHERE id=$1 RETURNING *',
        [id]
      );
      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
