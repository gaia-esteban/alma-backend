import { Op } from 'sequelize';
import companyRepository from '../repositories/companyRepository.js';
import logger from '../utils/logger.js';

const REDACTED_SECRET = '********';

function sanitizeCompany(company) {
  if (!company?.mailbox_config?.clientSecret) {
    return company;
  }

  return {
    ...company,
    mailbox_config: {
      ...company.mailbox_config,
      clientSecret: REDACTED_SECRET,
    },
  };
}

class CompanyService {
  async getAllCompanies(filters = {}, currentUser) {
    try {
      const { page = 1, limit = 10, description } = filters;
      const offset = (page - 1) * limit;

      const where = {};
      if (currentUser.role !== 'admin') {
        where.id = { [Op.in]: currentUser.company_access };
      }
      if (description) where.description = { [Op.iLike]: `%${description}%` };

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      };

      const companies = await companyRepository.findAll(options);
      const total = await companyRepository.count(where);

      logger.info(`Retrieved ${companies.length} companies`);

      return {
        data: companies.map(c => sanitizeCompany(c.toJSON())),
        total,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all companies');
      throw error;
    }
  }

  async getCompanyById(id, currentUser) {
    try {
      const company = await companyRepository.findById(id);
      if (!company || (currentUser.role !== 'admin' && !currentUser.company_access.includes(String(id)))) {
        throw new Error('Company not found');
      }

      logger.info(`Retrieved company: ${company.id}`);
      return sanitizeCompany(company.toJSON());
    } catch (error) {
      logger.error({ err: error }, `Error getting company by ID ${id}`);
      throw error;
    }
  }

  async createCompany(data) {
    try {
      const company = await companyRepository.create(data);
      logger.info(`Company created: ${company.id}`);

      return sanitizeCompany(company.toJSON());
    } catch (error) {
      logger.error({ err: error }, 'Error creating company');
      throw error;
    }
  }

  async updateCompany(id, updates) {
    try {
      const updated = await companyRepository.update(id, updates);
      if (!updated) {
        throw new Error('Company not found');
      }

      logger.info(`Company updated: ${updated.id}`);
      return sanitizeCompany(updated.toJSON());
    } catch (error) {
      logger.error({ err: error }, `Error updating company ${id}`);
      throw error;
    }
  }
}

export default new CompanyService();
