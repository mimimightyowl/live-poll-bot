import { Express } from 'express';
import usersRoutes from '../modules/users/users.routes';
import pollsRoutes from '../modules/polls/polls.routes';
import votesRoutes from '../modules/votes/votes.routes';
import db from '../shared/db';
import logger from '../shared/logger';
import realtimeNotifier from '../shared/realtime-notifier';

const setupRoutes = (app: Express): void => {
  // API routes
  app.use('/api/users', usersRoutes);
  app.use('/api/polls', pollsRoutes);
  app.use('/api/votes', votesRoutes);

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     description: Returns the health status of the API service including database and gRPC connection checks
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "healthy"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00Z"
   *                 service:
   *                   type: string
   *                   example: "api-service"
   *                 version:
   *                   type: string
   *                   example: "1.0.0"
   *                 checks:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: string
   *                       example: "ok"
   *                     grpc:
   *                       type: string
   *                       example: "ok"
   *             example:
   *               status: "healthy"
   *               timestamp: "2024-01-15T10:30:00Z"
   *               service: "api-service"
   *               version: "1.0.0"
   *               checks:
   *                 database: "ok"
   *                 grpc: "ok"
   *       503:
   *         description: Service is unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "unhealthy"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 service:
   *                   type: string
   *                 version:
   *                   type: string
   *                 checks:
   *                   type: object
   */
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
      await realtimeNotifier.checkConnection();
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
      service: 'api-service',
      version: '1.0.0',
      checks,
    });
  });
};

export default setupRoutes;
