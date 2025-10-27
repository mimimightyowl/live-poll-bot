import { Express } from 'express';

const setupMiddlewares = (app: Express): void => {
  // Parse JSON bodies
  app.use(require('express').json());
};

export default setupMiddlewares;
