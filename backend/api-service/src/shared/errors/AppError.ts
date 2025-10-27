export default class AppError extends Error {
  public statusCode: number;
  public code: string | null;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
