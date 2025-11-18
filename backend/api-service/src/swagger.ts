import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Live Poll Bot API',
      version: '1.0.0',
      description: 'REST API for Live Poll Bot system',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts', './src/app/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
