import './shared/env-loader';
import logger from './shared/logger';
import { startBot } from './bot';
import { startHealthServer } from './health-server';

async function main() {
  try {
    logger.info('Starting Telegram Bot Service...');

    // Start health check HTTP server
    startHealthServer();

    // Start Telegram bot
    await startBot();
    logger.info('Telegram Bot Service started successfully');
  } catch (error) {
    logger.error('Failed to start Telegram Bot Service:', error as Error);
    process.exit(1);
  }
}

main();
