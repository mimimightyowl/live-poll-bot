import './shared/env-loader';
import logger from './shared/logger';
import { startBot } from './bot';

async function main() {
  try {
    logger.info('Starting Telegram Bot Service...');
    await startBot();
    logger.info('Telegram Bot Service started successfully');
  } catch (error) {
    logger.error('Failed to start Telegram Bot Service:', error as Error);
    process.exit(1);
  }
}

main();
