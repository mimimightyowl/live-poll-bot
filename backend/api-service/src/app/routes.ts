import { Express } from 'express';
import usersRoutes from '../modules/users/users.routes';

const setupRoutes = (app: Express): void => {
  // API routes
  app.use('/api/users', usersRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'API service is running',
      timestamp: new Date().toISOString(),
    });
  });
};

export default setupRoutes;
