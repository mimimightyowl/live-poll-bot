import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config';
import logger from '../shared/logger';

type PurifyInstance = {
  sanitize(source: string, config?: Record<string, unknown>): string;
};

let purify: PurifyInstance | null = null;

if (process.env.NODE_ENV !== 'test') {
  const { JSDOM } = require('jsdom');
  const DOMPurify = require('dompurify');
  const window = new JSDOM('').window;
  purify = DOMPurify(window as any);
}

// Rate limiting configuration: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CORS configuration
const getCorsOptions = () => {
  // In production, use CORS_ORIGINS if provided, otherwise fall back to CORS_ORIGIN
  if (env.NODE_ENV === 'production') {
    if (env.CORS_ORIGINS.length > 0) {
      return {
        origin: (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void
        ) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) {
            return callback(null, true);
          }
          if (env.CORS_ORIGINS.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
        ],
      };
    }
    // Fallback to single origin or wildcard
    return {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ],
    };
  }
  // Development: allow all origins
  return {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  };
};

// XSS sanitization middleware
const sanitizeInput = (obj: any): any => {
  if (typeof obj === 'string' && purify) {
    return purify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeInput(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

const sanitizeObject = (target: Record<string, unknown>): void => {
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = sanitizeInput(target[key]);
    }
  }
};

const xssSanitize = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query as Record<string, unknown>);
  }
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
};

const setupMiddlewares = (app: Express): void => {
  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable if causing issues with CORS
    })
  );

  // CORS middleware (must be before routes)
  app.use(cors(getCorsOptions()));

  // Rate limiting (apply to all requests)
  app.use(limiter);

  // Parse JSON bodies
  app.use(express.json());

  // XSS sanitization (after JSON parsing to sanitize parsed body)
  app.use(xssSanitize);

  logger.info('Security middlewares configured');
  logger.info(
    `CORS: ${env.NODE_ENV === 'production' ? (env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS.join(', ') : env.CORS_ORIGIN) : 'all origins (development)'}`
  );
};

export default setupMiddlewares;
