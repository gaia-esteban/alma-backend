import eventLogRepository from '../repositories/eventLogRepository.js';
import { ENTITY, EVENT_NAME, OUTCOME } from '../models/EventLog.js';
import logger from '../utils/logger.js';

class EventLogService {
  async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = 'DESC',
        entity,
        eventName,
        userId,
        userEmail,
        startDate,
        endDate,
      } = filters;

      const offset = (page - 1) * limit;

      const validOrderBy = ['ASC', 'DESC'];
      const sortOrder = validOrderBy.includes(String(orderBy).toUpperCase())
        ? String(orderBy).toUpperCase()
        : 'DESC';

      const where = {};
      if (entity) where.entity = entity;
      if (eventName) where.event_name = eventName;
      if (userId) where.user_id = userId;
      if (userEmail) where.user_email = userEmail;

      if (startDate || endDate) {
        const { Op } = await import('sequelize');
        where.created_at = {};
        if (startDate) where.created_at[Op.gte] = new Date(startDate);
        if (endDate) where.created_at[Op.lte] = new Date(endDate);
      }

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy: sortOrder,
      };

      const [logs, total] = await Promise.all([
        eventLogRepository.findAll(options),
        eventLogRepository.count(where),
      ]);

      logger.info(`Retrieved ${logs.length} event logs`);

      return {
        data: logs.map(log => log.toJSON()),
        total,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all event logs');
      throw error;
    }
  }

  async getById(id) {
    try {
      const log = await eventLogRepository.findById(id);
      if (!log) {
        throw new Error('Event log not found');
      }
      logger.info(`Retrieved event log: ${log.id}`);
      return log.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error getting event log by ID ${id}`);
      throw error;
    }
  }

  async create(data) {
    try {
      const { entity, eventName, userId, userEmail, outcome } = data;

      if (!entity || !Object.values(ENTITY).includes(entity)) {
        throw new Error(`entity must be one of: ${Object.values(ENTITY).join(', ')}`);
      }
      if (!eventName || !Object.values(EVENT_NAME).includes(eventName)) {
        throw new Error(`eventName must be one of: ${Object.values(EVENT_NAME).join(', ')}`);
      }
      if (outcome !== undefined && outcome !== null && !Object.values(OUTCOME).includes(outcome)) {
        throw new Error(`outcome must be one of: ${Object.values(OUTCOME).join(', ')}`);
      }

      const log = await eventLogRepository.create({ entity, eventName, userId, userEmail, outcome });
      logger.info(`Created event log: ${log.id}`);
      return log.toJSON();
    } catch (error) {
      logger.error({ err: error }, 'Error creating event log');
      throw error;
    }
  }
}

export { ENTITY, EVENT_NAME, OUTCOME };
export default new EventLogService();
