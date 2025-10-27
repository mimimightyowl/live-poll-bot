import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

interface PgErrorMap {
  [key: string]: {
    status: number;
    message: string;
  };
}

const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error caught:', err);

  // Если это AppError — используем его данные
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
    };

    if (err.code) {
      response.code = err.code;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Обработка Postgres ошибок
  const pgErrorMap: PgErrorMap = {
    '23505': {
      status: 409,
      message: 'Duplicate key value violates unique constraint',
    },
    '23503': {
      status: 400,
      message: 'Foreign key constraint violation',
    },
    '23502': { status: 400, message: 'Not null constraint violation' },
    '23514': { status: 400, message: 'Check constraint violation' },
    '42P01': { status: 500, message: 'Undefined table' },
    '42703': { status: 500, message: 'Undefined column' },
  };

  const error = err as any; // для доступа к code

  if (error.code && pgErrorMap[error.code]) {
    const mapped = pgErrorMap[error.code];
    res.status(mapped.status).json({
      success: false,
      error: mapped.message,
      code: error.code,
    });
    return;
  }

  // Обработка ошибок подключения к БД
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      code: error.code,
    });
    return;
  }

  // Неизвестная ошибка
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
};

export default errorHandler;
