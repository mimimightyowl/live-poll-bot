import express, { Express } from 'express';
import setupMiddlewares from './middlewares';
import setupRoutes from './routes';
import errorHandler from '../shared/errors/error-handler';
import { setupSwagger } from '../swagger';

const createApp = (): Express => {
  const app = express();

  // Setup middlewares
  setupMiddlewares(app);

  // Setup Swagger documentation
  setupSwagger(app);

  // Setup routes
  setupRoutes(app);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
