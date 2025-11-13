import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import createApp from './app';
import { env } from './config';
import webSocketManager from './modules/websocket/websocket.manager';
import logger from './shared/logger';
import { startGrpcServer } from './grpc-server';

// Create HTTP Express app
const app = createApp();
const httpServer = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ port: env.WS_PORT });

// Initialize WebSocket manager
webSocketManager.initialize(wss);

// Start HTTP server
httpServer.listen(env.HTTP_PORT, () => {
  logger.info(`HTTP notification server running on port ${env.HTTP_PORT}`);
});

// WebSocket server is already listening
logger.info(`WebSocket server running on port ${env.WS_PORT}`);

// Start gRPC server
startGrpcServer(50052);

logger.info(`Environment: ${env.NODE_ENV}`);

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');

  wss.close(() => {
    logger.info('WebSocket server closed');
  });

  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
