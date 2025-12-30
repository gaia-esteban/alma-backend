import pino from 'pino';
import { config } from '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for file logging
const errorStream = pino.destination({
  dest: path.join(logsDir, 'error.log'),
  sync: false,
  mkdir: true,
});

const combinedStream = pino.destination({
  dest: path.join(logsDir, 'combined.log'),
  sync: false,
  mkdir: true,
});

// Create Pino logger instance with multiple streams
const logger = pino(
  {
    level: config.log.level || 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString().replace('T', ' ').substring(0, 19)}"`,
    base: null, // Remove pid, hostname from logs for cleaner output
  },
  pino.multistream([
    // Console output with pretty printing in development
    {
      level: config.log.level || 'info',
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }),
    },
    // File output for all logs
    {
      level: config.log.level || 'info',
      stream: combinedStream,
    },
    // File output for errors only
    {
      level: 'error',
      stream: errorStream,
    },
  ])
);

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ err: reason, promise }, 'Unhandled Rejection');
});

export default logger;
