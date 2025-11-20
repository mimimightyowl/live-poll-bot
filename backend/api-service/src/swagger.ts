import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { env } from './config';
import logger from './shared/logger';

// Get the project root directory (backend/api-service)
// __dirname in dev (ts-node): backend/api-service/src
// __dirname in prod (compiled): backend/api-service/dist
const projectRoot = path.resolve(__dirname, '..');

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
  apis: [
    path.join(projectRoot, 'src', 'modules', '**', '*.routes.ts'),
    path.join(projectRoot, 'src', 'app', 'routes.ts'),
  ],
};

let swaggerSpec: any;

try {
  // Log the paths being used for debugging
  logger.info(`Swagger API paths: ${JSON.stringify(options.apis)}`);
  swaggerSpec = swaggerJsdoc(options);
  logger.info('Swagger documentation initialized successfully');
  logger.info(`Found ${Object.keys(swaggerSpec.paths || {}).length} API paths`);
} catch (error) {
  logger.error(
    'Failed to initialize Swagger documentation:',
    error instanceof Error ? error : new Error(String(error))
  );
  // Create a minimal spec to prevent crashes
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Live Poll Bot API',
      version: '1.0.0',
      description:
        'REST API for Live Poll Bot system - Documentation initialization failed',
    },
    paths: {},
  };
}

export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Live Poll Bot API Documentation',
    })
  );
  logger.info(`Swagger UI available at http://localhost:${env.PORT}/api-docs`);
}
