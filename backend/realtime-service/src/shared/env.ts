import './env-loader';

export const env = {
  // Server
  WS_PORT: parseInt(process.env.WS_PORT || '3001', 10),
  HTTP_PORT: parseInt(process.env.HTTP_PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Service (gRPC)
  API_SERVICE_GRPC_URL: process.env.API_SERVICE_GRPC_URL || 'localhost:50051',
};
