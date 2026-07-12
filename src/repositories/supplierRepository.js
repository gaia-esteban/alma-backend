import Supplier from '../models/Supplier.js';
import logger from '../utils/logger.js';

class SupplierRepository {
  async create(data) {
    try {
      const supplier = await Supplier.create(data);
      logger.info(`Supplier created: ${supplier.id}`);
      return supplier;
    } catch (error) {
      logger.error({ err: error }, 'Error creating supplier');
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Supplier.findByPk(id, {
        include: [{ association: 'company', attributes: ['id', 'description'] }],
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding supplier by ID ${id}`);
      throw error;
    }
  }

  async findByIdentificationAndCompany(identification, company_id) {
    try {
      return await Supplier.findOne({ where: { identification, company_id } });
    } catch (error) {
      logger.error({ err: error }, 'Error finding supplier by identification and company');
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      return await Supplier.findAll({
        include: [{ association: 'company', attributes: ['id', 'description'] }],
        ...options,
      });
    } catch (error) {
      logger.error({ err: error }, 'Error finding all suppliers');
      throw error;
    }
  }

  async count(where = {}) {
    try {
      return await Supplier.count({ where });
    } catch (error) {
      logger.error({ err: error }, 'Error counting suppliers');
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return null;
      }
      await supplier.update(updates);
      logger.info(`Supplier updated: ${supplier.id}`);
      return supplier;
    } catch (error) {
      logger.error({ err: error }, `Error updating supplier ${id}`);
      throw error;
    }
  }
}

export default new SupplierRepository();
