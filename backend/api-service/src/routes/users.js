const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users - получить всех пользователей
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users',
    });
  }
});

// GET /api/users/:id - получить пользователя по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user',
    });
  }
});

// POST /api/users - создать нового пользователя
router.post('/', async (req, res) => {
  try {
    const { username, email, full_name, telegram_id } = req.body;

    // Валидация обязательных полей
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username and email are required',
      });
    }

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
    console.error('Error creating user:', err);

    // Обработка ошибок уникальности
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'User with this username or email already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating user',
    });
  }
});

// PUT /api/users/:id - обновить пользователя
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, telegram_id } = req.body;

    // Валидация обязательных полей
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username and email are required',
      });
    }

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, full_name = $3, telegram_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [username, email, full_name || null, telegram_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully',
    });
  } catch (err) {
    console.error('Error updating user:', err);

    // Обработка ошибок уникальности
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'User with this username or email already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while updating user',
    });
  }
});

// DELETE /api/users/:id - удалить пользователя
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting user',
    });
  }
});

module.exports = router;
