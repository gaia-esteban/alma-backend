import supplierService from '../services/supplierService.js';
import logger from '../utils/logger.js';

class SupplierController {
  /**
   * Get all suppliers
   * @route GET /api/suppliers
   */
  async getAllSuppliers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        companyIds: req.companyIds,
        is_active: req.query.is_active,
        identification: req.query.identification,
      };

      const result = await supplierService.getAllSuppliers(filters);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all suppliers error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los proveedores',
      });
    }
  }

  /**
   * Get supplier by ID
   * @route GET /api/suppliers/:id
   */
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;

      const supplier = await supplierService.getSupplierById(id, req.companyIds);

      return res.status(200).json({
        success: true,
        message: 'Proveedor obtenido correctamente',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get supplier by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Proveedor no encontrado',
      });
    }
  }

  /**
   * Create new supplier
   * @route POST /api/suppliers
   */
  async createSupplier(req, res) {
    try {
      const data = req.body;

      if (!data.identification) {
        return res.status(400).json({
          success: false,
          message: 'La identificación es obligatoria',
        });
      }

      const supplier = await supplierService.createSupplier(data, req.companyId);

      return res.status(201).json({
        success: true,
        message: 'Proveedor creado correctamente',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create supplier error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el proveedor',
      });
    }
  }

  /**
   * Update supplier
   * @route PATCH /api/suppliers/:id
   */
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const supplier = await supplierService.updateSupplier(id, updates, req.companyId);

      return res.status(200).json({
        success: true,
        message: 'Proveedor actualizado correctamente',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update supplier error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el proveedor',
      });
    }
  }
}

export default new SupplierController();
