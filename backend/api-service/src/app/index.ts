import express, { Express } from 'express';
import setupMiddlewares from './middlewares';
import setupRoutes from './routes';
import errorHandler from '../shared/errors/error-handler';
import logger from '../shared/logger';
import { setupSwagger } from '../swagger';

const createApp = (): Express => {
  const app = express();

  logger.info('Creating Express app...');

  // Setup middlewares
  logger.info('Setting up middlewares...');
  setupMiddlewares(app);

  // Setup Swagger documentation
  logger.info('Setting up Swagger...');
  try {
    setupSwagger(app);
    logger.info('Swagger setup completed');
  } catch (error) {
    logger.error(
      'Swagger setup failed, continuing without it:',
      error instanceof Error ? error : new Error(String(error))
    );
  }

  // Setup routes
  logger.info('Setting up routes...');
  setupRoutes(app);
  logger.info('Routes setup completed');

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
