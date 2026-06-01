import EventLog from '../models/EventLog.js';
import logger from '../utils/logger.js';

class EventLogRepository {
  async findById(id) {
    try {
      return await EventLog.findByPk(id);
    } catch (error) {
      logger.error({ err: error }, `Error finding event log by ID ${id}`);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { orderBy = 'DESC', ...otherOptions } = options;
      return await EventLog.findAll({
        ...otherOptions,
        order: [['created_at', orderBy]],
      });
    } catch (error) {
      logger.error({ err: error }, 'Error finding all event logs');
      throw error;
    }
  }

  async count(where = {}) {
    try {
      return await EventLog.count({ where });
    } catch (error) {
      logger.error({ err: error }, 'Error counting event logs');
      throw error;
    }
  }

  async create(data) {
    try {
      return await EventLog.create(data);
    } catch (error) {
      logger.error({ err: error }, 'Error creating event log');
      throw error;
    }
  }
}

export default new EventLogRepository();
