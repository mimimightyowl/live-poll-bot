import { Express } from 'express';
import usersRoutes from '../modules/users/users.routes';
import pollsRoutes from '../modules/polls/polls.routes';
import votesRoutes from '../modules/votes/votes.routes';
import db from '../shared/db';
import realtimeNotifier from '../shared/realtime-notifier';
import logger from '../shared/logger';

const setupRoutes = (app: Express): void => {
  // API routes
  app.use('/api/users', usersRoutes);
  app.use('/api/polls', pollsRoutes);
  app.use('/api/votes', votesRoutes);

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const checks: Record<string, string> = {};
    let status = 'healthy';

    // Check database
    try {
      await db.query('SELECT 1');
      checks.database = 'ok';
    } catch (error) {
      checks.database = 'error';
      status = 'unhealthy';
      logger.error('Health check - database error:', error as Error);
    }

    // Check realtime-service gRPC
    try {
      // Try to notify with a test poll ID (-1) to check connectivity
      // The RealtimeNotifier already handles errors gracefully
      await realtimeNotifier.notifyPollUpdate(-1);
      checks.grpc = 'ok';
    } catch (error) {
      checks.grpc = 'error';
      status = 'unhealthy';
      logger.warn('Health check - gRPC error:', error as Error);
    }

    res.status(status === 'healthy' ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      service: 'api-service',
      version: '1.0.0',
      checks,
    });
  });
};

export default setupRoutes;
