import { Op } from 'sequelize';
import companyRepository from '../repositories/companyRepository.js';
import logger from '../utils/logger.js';

const REDACTED_SECRET = '********';

function sanitizeCompany(company) {
  if (!company) {
    return company;
  }

  const sanitized = { ...company };

  if (company.mailbox_config?.clientSecret) {
    sanitized.mailbox_config = { ...company.mailbox_config, clientSecret: REDACTED_SECRET };
  }

  if (company.accounting_config?.accessKey) {
    sanitized.accounting_config = { ...company.accounting_config, accessKey: REDACTED_SECRET };
  }

  return sanitized;
}

/**
 * GET responses mask accessKey, so a client that edits a company and sends the
 * config back unchanged would overwrite the real key with the mask. Swap the
 * mask (or a missing key) for the stored value.
 */
function preserveAccessKey(updates, existing) {
  const incoming = updates.accounting_config;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return updates;
  }

  if (incoming.accessKey !== undefined && incoming.accessKey !== REDACTED_SECRET) {
    return updates;
  }

  const storedKey = existing?.accounting_config?.accessKey;
  if (!storedKey) {
    return updates;
  }

  return { ...updates, accounting_config: { ...incoming, accessKey: storedKey } };
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
      const existing = await companyRepository.findById(id);
      if (!existing) {
        throw new Error('Company not found');
      }

      const updated = await companyRepository.update(id, preserveAccessKey(updates, existing.toJSON()));
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
