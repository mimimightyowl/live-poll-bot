import * as http from 'http';
import pollsClient from './modules/polls/polls.client';
import usersClient from './modules/users/users.client';
import logger from './shared/logger';

const PORT = 3000;

export function startHealthServer(): void {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      const checks: Record<string, string> = {};
      let status = 'healthy';

      // Check Telegram bot status
      // The bot is running if we reach this point
      checks.telegram_bot = 'ok';

      // Check API service gRPC (users service)
      try {
        // Try to get a user with a test telegram_id to check connectivity
        await usersClient.getUserByTelegramId({ telegram_id: 'health_check' });
        checks.grpc_users = 'ok';
      } catch (error: any) {
        // Connection errors are critical, but NOT_FOUND is expected for health check
        if (error.code === 5) {
          // NOT_FOUND - connection is working
          checks.grpc_users = 'ok';
        } else {
          checks.grpc_users = 'error';
          status = 'unhealthy';
          logger.warn('Health check - gRPC users error:', error as Error);
        }
      }

      // Check API service gRPC (polls service)
      try {
        // Try to get a poll with ID -1 to check connectivity
        await pollsClient.getPoll({ id: -1 });
        checks.grpc_polls = 'ok';
      } catch (error: any) {
        // Connection errors are critical, but NOT_FOUND is expected for health check
        if (error.code === 5) {
          // NOT_FOUND - connection is working
          checks.grpc_polls = 'ok';
        } else {
          checks.grpc_polls = 'error';
          status = 'unhealthy';
          logger.warn('Health check - gRPC polls error:', error as Error);
        }
      }

      const statusCode = status === 'healthy' ? 200 : 503;
      const response = {
        status,
        timestamp: new Date().toISOString(),
        service: 'bot-service',
        version: '1.0.0',
        checks,
      };

      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    logger.info(`Health check server running on port ${PORT}`);
  });
}
