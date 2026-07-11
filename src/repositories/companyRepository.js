import Company from '../models/Company.js';
import logger from '../utils/logger.js';

class CompanyRepository {
  async create(data) {
    try {
      const company = await Company.create(data);
      logger.info(`Company created: ${company.id}`);
      return company;
    } catch (error) {
      logger.error({ err: error }, 'Error creating company');
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Company.findByPk(id);
    } catch (error) {
      logger.error({ err: error }, `Error finding company by ID ${id}`);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      return await Company.findAll(options);
    } catch (error) {
      logger.error({ err: error }, 'Error finding all companies');
      throw error;
    }
  }

  async count(where = {}) {
    try {
      return await Company.count({ where });
    } catch (error) {
      logger.error({ err: error }, 'Error counting companies');
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const company = await Company.findByPk(id);
      if (!company) {
        return null;
      }
      await company.update(updates);
      logger.info(`Company updated: ${company.id}`);
      return company;
    } catch (error) {
      logger.error({ err: error }, `Error updating company ${id}`);
      throw error;
    }
  }
}

export default new CompanyRepository();
