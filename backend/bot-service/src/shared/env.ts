import './env-loader';

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',

  // API Service (gRPC)
  API_SERVICE_GRPC_URL: process.env.API_SERVICE_GRPC_URL || 'localhost:50051',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',
};
