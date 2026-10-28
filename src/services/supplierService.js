import { Op } from 'sequelize';
import supplierRepository from '../repositories/supplierRepository.js';
import logger from '../utils/logger.js';

class SupplierService {
  async getAllSuppliers(filters = {}) {
    try {
      const { page = 1, limit = 10, companyIds, is_active, identification, search } = filters;
      const offset = (page - 1) * limit;

      // Base filters shared by the list query and the status-tab counts (everything except is_active)
      const baseWhere = { company_id: { [Op.in]: companyIds } };
      if (identification) baseWhere.identification = identification;
      if (search) {
        baseWhere[Op.or] = [
          { identification: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const where = { ...baseWhere };
      if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      };

      const [suppliers, total, allCount, activeCount, inactiveCount] = await Promise.all([
        supplierRepository.findAll(options),
        supplierRepository.count(where),
        supplierRepository.count(baseWhere),
        supplierRepository.count({ ...baseWhere, is_active: true }),
        supplierRepository.count({ ...baseWhere, is_active: false }),
      ]);

      logger.info(`Retrieved ${suppliers.length} suppliers`);

      return {
        data: suppliers.map(s => s.toJSON()),
        total,
        counts: { all: allCount, active: activeCount, inactive: inactiveCount },
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all suppliers');
      throw error;
    }
  }

  async getSupplierById(id, companyIds) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier || !companyIds.includes(String(supplier.company_id))) {
        throw new Error('Proveedor no encontrado');
      }

      logger.info(`Retrieved supplier: ${supplier.id}`);
      return supplier.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error getting supplier by ID ${id}`);
      throw error;
    }
  }

  async createSupplier(data, companyId) {
    try {
      data.company_id = companyId;

      const existing = await supplierRepository.findByIdentificationAndCompany(
        data.identification,
        data.company_id
      );
      if (existing) {
        throw new Error('Ya existe un proveedor con esta identificación para esta compañía');
      }

      const supplier = await supplierRepository.create(data);
      logger.info(`Supplier created: ${supplier.id}`);

      return supplier.toJSON();
    } catch (error) {
      logger.error({ err: error }, 'Error creating supplier');
      throw error;
    }
  }

  async updateSupplier(id, updates, companyId) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier || String(supplier.company_id) !== companyId) {
        throw new Error('Proveedor no encontrado');
      }

      // Suppliers cannot be moved to a different company through this endpoint
      updates.company_id = supplier.company_id;

      // If identification changes, check uniqueness
      const newIdentification = updates.identification ?? supplier.identification;
      const newCompanyId = supplier.company_id;

      if (newIdentification !== supplier.identification) {
        const conflict = await supplierRepository.findByIdentificationAndCompany(
          newIdentification,
          newCompanyId
        );
        if (conflict && conflict.id !== supplier.id) {
          throw new Error('Ya existe un proveedor con esta identificación para esta compañía');
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
