import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Server configuration
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || 'localhost',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'alma_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // TOTP configuration
  totp: {
    issuer: process.env.TOTP_ISSUER || 'AlMa',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Logging configuration
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Automation tool Alma credentials
  automation: {
    webhookUrl: process.env.AUTO_WEBHOOK_URL || 'https://auto.digital.almafconsultora.com',
    webhookEnv: process.env.AUTO_WEBHOOK_ENV || 'webhook/test',
    webhookPath: process.env.AUTO_WEBHOOK_PATH || '',
    user: process.env.AUTO_USER || 'alma',
    password: process.env.AUTO_PASSWORD || '',
  },

  // Email configuration
  email: {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    sender: process.env.EMAIL_SENDER || 'AlMa Digital',
    registerSubject: process.env.EMAIL_REGISTER_SUBJECT || 'Welcome to AlMa Digital!',
  },
};

export default config;
