import { Express } from 'express';
import websocketRoutes from '../modules/websocket/websocket.routes';
import webSocketManager from '../modules/websocket/websocket.manager';

const setupRoutes = (app: Express): void => {
  // WebSocket notification routes
  app.use('/api', websocketRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Realtime service is running',
      timestamp: new Date().toISOString(),
      connections: webSocketManager.getTotalConnections(),
    });
  });
};

export default setupRoutes;
