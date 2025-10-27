class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // код Postgres или кастомный код
    this.isOperational = true; // для различия системных и бизнес-ошибок
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
