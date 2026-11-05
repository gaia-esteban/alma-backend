import { Op } from 'sequelize';
import companyRepository from '../repositories/companyRepository.js';
import logger from '../utils/logger.js';
import { MAILBOX_SECRET_FIELDS } from '../models/Company.js';

const REDACTED_SECRET = '********';

function sanitizeCompany(company) {
  if (!company) {
    return company;
  }

  const sanitized = { ...company };

  if (Array.isArray(company.mailbox_configs)) {
    sanitized.mailbox_configs = company.mailbox_configs.map(redactMailboxSecrets);
  }

  if (company.accounting_config?.accessKey) {
    sanitized.accounting_config = { ...company.accounting_config, accessKey: REDACTED_SECRET };
  }

  return sanitized;
}

function redactMailboxSecrets(entry) {
  if (!entry || typeof entry !== 'object') {
    return entry;
  }
  const redacted = { ...entry };
  for (const field of MAILBOX_SECRET_FIELDS) {
    if (redacted[field]) {
      redacted[field] = REDACTED_SECRET;
    }
  }
  return redacted;
}

/**
 * mailbox_configs is replaced wholesale on PATCH, but GET responses mask each
 * entry's secrets. For every incoming entry whose secret is the mask (or
 * missing), restore the stored secret of the existing entry with the same
 * mailboxUser (case-insensitive) and provider. A new mailbox, or one whose
 * provider changed, has nothing to restore: sending the mask for it is an
 * error (the mask is a non-empty string, so model validation alone would
 * accept it and store "********" as the real secret). Also used on create,
 * with no existing company, purely for that check.
 */
function preserveMailboxSecrets(updates, existing) {
  const incoming = updates.mailbox_configs;
  if (!Array.isArray(incoming)) {
    return updates;
  }

  const storedByUser = new Map(
    (Array.isArray(existing?.mailbox_configs) ? existing.mailbox_configs : [])
      .filter((entry) => typeof entry?.mailboxUser === 'string')
      .map((entry) => [entry.mailboxUser.trim().toLowerCase(), entry])
  );

  const merged = incoming.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || typeof entry.mailboxUser !== 'string') {
      return entry; // let model validation report the shape error
    }

    const stored = storedByUser.get(entry.mailboxUser.trim().toLowerCase());
    const result = { ...entry };

    for (const field of MAILBOX_SECRET_FIELDS) {
      if (result[field] !== undefined && result[field] !== REDACTED_SECRET) {
        continue;
      }
      if (stored && stored.provider === entry.provider && stored[field]) {
        result[field] = stored[field];
      } else if (result[field] === REDACTED_SECRET) {
        throw new Error(
          `mailbox_configs[${index}].${field} must be provided for ${entry.mailboxUser} (no stored value to keep)`
        );
      }
    }

    return result;
  });

  return { ...updates, mailbox_configs: merged };
}

/**
 * The single-object mailbox_config field was replaced by the mailbox_configs
 * array. Sequelize silently drops unknown attributes, so fail loudly instead of
 * letting an old client think its mailbox change was saved.
 */
function rejectLegacyMailboxConfig(data) {
  if (data && Object.prototype.hasOwnProperty.call(data, 'mailbox_config')) {
    throw new Error('mailbox_config is no longer supported; send mailbox_configs (an array of mailboxes) instead');
  }
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
      rejectLegacyMailboxConfig(data);
      const company = await companyRepository.create(preserveMailboxSecrets(data, null));
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

      rejectLegacyMailboxConfig(updates);
      const existingJson = existing.toJSON();
      const merged = preserveMailboxSecrets(preserveAccessKey(updates, existingJson), existingJson);
      const updated = await companyRepository.update(id, merged);
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
