const express = require('express');
const router = express.Router();
const pool = require('../db');
const AppError = require('../errors/AppError');
const validate = require('../middlewares/validate');
const {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
} = require('../validation/users.schema');

// GET /api/users
router.get('/', async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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

module.exports = router;
