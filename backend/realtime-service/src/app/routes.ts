import { Express } from 'express';
import websocketRoutes from '../modules/websocket/websocket.routes';
import webSocketManager from '../modules/websocket/websocket.manager';
import apiServiceClient from '../grpc-clients/api-service.client';
import logger from '../shared/logger';

const setupRoutes = (app: Express): void => {
  // WebSocket notification routes
  app.use('/api', websocketRoutes);

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const checks: Record<string, string> = {};
    let status = 'healthy';

    // Check WebSocket manager
    checks.websocket = 'ok';
    checks.connections = webSocketManager.getTotalConnections().toString();

    // Check API service gRPC
    try {
      // Try to get poll results for a non-existent poll to check connectivity
      await apiServiceClient.getPollResults(-1);
      checks.grpc = 'ok';
    } catch (error: any) {
      // Connection errors are critical, but NOT_FOUND is expected for health check
      if (error.code === 5) {
        // NOT_FOUND - connection is working
        checks.grpc = 'ok';
      } else {
        checks.grpc = 'error';
        status = 'unhealthy';
        logger.warn('Health check - gRPC error:', error as Error);
      }
    }

    res.status(status === 'healthy' ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      service: 'realtime-service',
      version: '1.0.0',
      checks,
    });
  });
};

export default setupRoutes;
