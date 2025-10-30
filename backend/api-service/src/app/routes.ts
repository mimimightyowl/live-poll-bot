import { Express } from 'express';
import usersRoutes from '../modules/users/users.routes';
import pollsRoutes from '../modules/polls/polls.routes';
import votesRoutes from '../modules/votes/votes.routes';

const setupRoutes = (app: Express): void => {
  // API routes
  app.use('/api/users', usersRoutes);
  app.use('/api/polls', pollsRoutes);
  app.use('/api/votes', votesRoutes);

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
