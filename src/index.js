import express from 'express';
import { config } from './config/env.js';
import { testConnection } from './config/database.js';
import logger from './utils/logger.js';
import { corsMiddleware, corsErrorHandler } from './middlewares/cors.js';
import routes from './routes/index.js';

// Import models to ensure they're registered
import './models/User.js';
import './models/IncomingInvoice.js';
import './models/IncomingInvoiceDetails.js';

/**
 * Initialize Express Application
 */
const app = express();

/**
 * Middleware Configuration
 */
// CORS
app.use(corsMiddleware);
app.use(corsErrorHandler);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AlMa Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      invoices: '/api/invoices',
    },
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'The referenced record does not exist',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.node_env === 'development' && { stack: err.stack }),
  });
});

/**
 * 404 Handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database models - DISABLED
    // logger.info('Synchronizing database models...');
    // const syncOptions = {
    //   // alter: true, // Use this to update existing tables (development only)
    //   // force: true, // Use this to drop and recreate tables (development only)
    // };

    // const isSynced = await syncDatabase(syncOptions);

    // if (!isSynced) {
    //   logger.error('Failed to sync database. Exiting...');
    //   process.exit(1);
    // }

    logger.info('Database sync is disabled. Skipping...');

    // Start listening
    app.listen(config.port, config.host, () => {
      logger.info(`Server running in ${config.node_env} mode`);
      logger.info(`Server listening on http://${config.host}:${config.port}`);
      logger.info(`API available at http://${config.host}:${config.port}/api`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

// Start the server
startServer();

export default app;
