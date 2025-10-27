const AppError = require('./AppError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('❌ Error caught:', err);

  // Если это AppError — используем его данные
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // Обработка Postgres ошибок
  const pgErrorMap = {
    23505: {
      status: 409,
      message: 'Duplicate key value violates unique constraint',
    },
    23503: {
      status: 400,
      message: 'Foreign key constraint violation',
    },
    23502: { status: 400, message: 'Not null constraint violation' },
    23514: { status: 400, message: 'Check constraint violation' },
    '42P01': { status: 500, message: 'Undefined table' },
    42703: { status: 500, message: 'Undefined column' },
  };

  if (err.code && pgErrorMap[err.code]) {
    const mapped = pgErrorMap[err.code];
    return res.status(mapped.status).json({
      success: false,
      error: mapped.message,
      code: err.code,
    });
  }

  // Обработка ошибок подключения к БД
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      code: err.code,
    });
  }

  // Неизвестная ошибка
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
};

module.exports = errorHandler;
