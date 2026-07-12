import eventLogService from '../services/eventLogService.js';
import logger from '../utils/logger.js';

class EventLogController {
  async getAll(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        orderBy: req.query.orderBy,
        entity: req.query.entity,
        eventName: req.query.eventName,
        userId: req.query.userId,
        userEmail: req.query.userEmail,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        companyIds: req.companyIds,
      };

      const result = await eventLogService.getAll(filters);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all event logs error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve event logs',
      });
    }
  }

  async create(req, res) {
    try {
      const { entity, eventName, userId, userEmail, outcome, companyId } = req.body;

      const log = await eventLogService.create({ entity, eventName, userId, userEmail, outcome, companyId });

      return res.status(201).json({
        success: true,
        message: 'Event log created successfully',
        data: { eventLog: log },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create event log error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create event log',
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const log = await eventLogService.getById(id, req.companyIds);

      return res.status(200).json({
        success: true,
        message: 'Event log retrieved successfully',
        data: { eventLog: log },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get event log by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Event log not found',
      });
    }
  }
}

export default new EventLogController();
