import supplierRepository from '../repositories/supplierRepository.js';
import logger from '../utils/logger.js';

class SupplierService {
  async getAllSuppliers(filters = {}) {
    try {
      const { page = 1, limit = 10, company_id, is_active, identification } = filters;
      const offset = (page - 1) * limit;

      const where = {};
      if (company_id) where.company_id = company_id;
      if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
      if (identification) where.identification = identification;

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      };

      const suppliers = await supplierRepository.findAll(options);
      const total = await supplierRepository.count(where);

      logger.info(`Retrieved ${suppliers.length} suppliers`);

      return {
        data: suppliers.map(s => s.toJSON()),
        total,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all suppliers');
      throw error;
    }
  }

  async getSupplierById(id) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      logger.info(`Retrieved supplier: ${supplier.id}`);
      return supplier.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error getting supplier by ID ${id}`);
      throw error;
    }
  }

  async createSupplier(data) {
    try {
      const existing = await supplierRepository.findByIdentificationAndCompany(
        data.identification,
        data.company_id
      );
      if (existing) {
        throw new Error('A supplier with this identification already exists for this company');
      }

      const supplier = await supplierRepository.create(data);
      logger.info(`Supplier created: ${supplier.id}`);

      return supplier.toJSON();
    } catch (error) {
      logger.error({ err: error }, 'Error creating supplier');
      throw error;
    }
  }

  async updateSupplier(id, updates) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // If identification or company_id changes, check uniqueness
      const newIdentification = updates.identification ?? supplier.identification;
      const newCompanyId = updates.company_id ?? supplier.company_id;

      if (
        newIdentification !== supplier.identification ||
        newCompanyId !== supplier.company_id
      ) {
        const conflict = await supplierRepository.findByIdentificationAndCompany(
          newIdentification,
          newCompanyId
        );
        if (conflict && conflict.id !== supplier.id) {
          throw new Error('A supplier with this identification already exists for this company');
        }
      }

      const updated = await supplierRepository.update(id, updates);
      logger.info(`Supplier updated: ${updated.id}`);

      return updated.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error updating supplier ${id}`);
      throw error;
    }
  }
}

export default new SupplierService();
