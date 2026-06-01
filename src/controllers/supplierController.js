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
        company_id: req.query.company_id,
        is_active: req.query.is_active,
        identification: req.query.identification,
      };

      const result = await supplierService.getAllSuppliers(filters);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all suppliers error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve suppliers',
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

      const supplier = await supplierService.getSupplierById(id);

      return res.status(200).json({
        success: true,
        message: 'Supplier retrieved successfully',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get supplier by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Supplier not found',
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

      if (!data.company_id || !data.identification) {
        return res.status(400).json({
          success: false,
          message: 'company_id and identification are required',
        });
      }

      const supplier = await supplierService.createSupplier(data);

      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create supplier error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create supplier',
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

      const supplier = await supplierService.updateSupplier(id, updates);

      return res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: { supplier },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update supplier error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update supplier',
      });
    }
  }
}

export default new SupplierController();
