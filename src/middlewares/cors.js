import cors from 'cors';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.cors.origin.includes(origin) || config.cors.origin.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

/**
 * CORS Middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Custom CORS Error Handler
 */
export function corsErrorHandler(err, req, res, next) {
  if (err.message === 'Not allowed by CORS') {
    logger.error(`CORS error for origin: ${req.headers.origin}`);
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
    });
  }
  next(err);
}

export default {
  corsMiddleware,
  corsErrorHandler,
};
