import { Sequelize } from 'sequelize';
import { config } from './env.js';
import logger from '../utils/logger.js';

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Unable to connect to the database');
    return false;
  }
}

/**
 * Sync database models
 * @param {Object} options - Sequelize sync options
 */
export async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options);
    logger.info('Database synchronized successfully.');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Error synchronizing database');
    return false;
  }
}

export default sequelize;
