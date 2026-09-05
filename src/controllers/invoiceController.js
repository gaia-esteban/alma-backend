import invoiceService from '../services/invoiceService.js';
import logger from '../utils/logger.js';

/**
 * Invoice Controller
 */
class InvoiceController {
  /**
   * Create new invoice
   * @route POST /api/invoices
   */
  async createInvoice(req, res) {
    try {
      const { invoice, details } = req.body;
      const currentUser = req.user;

      // Validate required fields
      if (!invoice || !invoice.invoiceNumber || !invoice.customerId) {
        return res.status(400).json({
          success: false,
          message: 'El número de factura y el ID de cliente son obligatorios',
        });
      }

      const result = await invoiceService.createInvoice(invoice, details || [], currentUser);

      return res.status(201).json({
        success: true,
        message: 'Factura creada correctamente',
        data: { invoice: result },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear la factura',
      });
    }
  }

  /**
   * Get all invoices
   * @route GET /api/incoming-orders
   */
  async getAllInvoices(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        companyIds: req.companyIds,
      };
      const currentUser = req.user;

      const result = await invoiceService.getAllInvoices(filters, currentUser);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener las facturas',
      });
    }
  }

  /**
   * Get invoice by ID
   * @route GET /api/incoming-orders/:id
   */
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const result = await invoiceService.getInvoiceById(id, req.companyIds, currentUser);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get invoice by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Factura no encontrada',
      });
    }
  }

  /**
   * Get invoice by invoice number
   * @route GET /api/invoices/number/:invoiceNumber
   */
  async getInvoiceByNumber(req, res) {
    try {
      const { invoiceNumber } = req.params;
      const currentUser = req.user;

      const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Factura obtenida correctamente',
        data: { invoice },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get invoice by number error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Factura no encontrada',
      });
    }
  }

  /**
   * Update invoice
   * @route PUT /api/invoices/:id
   */
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const { invoice, details } = req.body;
      const currentUser = req.user;

      const result = await invoiceService.updateInvoice(
        id,
        invoice || {},
        details,
        currentUser
      );

      return res.status(200).json({
        success: true,
        message: 'Factura actualizada correctamente',
        data: { invoice: result },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar la factura',
      });
    }
  }

  /**
   * Delete invoice
   * @route DELETE /api/invoices/:id
   */
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const result = await invoiceService.deleteInvoice(id, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Factura eliminada correctamente',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Delete invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar la factura',
      });
    }
  }

  /**
   * Update invoice status
   * @route PATCH /api/invoices/:id/status
   */
  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentUser = req.user;

      // Validate required fields
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El estado es obligatorio',
        });
      }

      const invoice = await invoiceService.updateInvoiceStatus(id, status, req.companyId, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Estado de la factura actualizado correctamente',
        data: { invoice },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update invoice status error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el estado de la factura',
      });
    }
  }

  /**
   * Get invoice statistics
   * @route GET /api/invoices/statistics
   */
  async getInvoiceStatistics(req, res) {
    try {
      const currentUser = req.user;

      const stats = await invoiceService.getInvoiceStatistics(currentUser);

      return res.status(200).json({
        success: true,
        message: 'Estadísticas de facturas obtenidas correctamente',
        data: stats,
      });
    } catch (error) {
      logger.error({ err: error }, 'Get invoice statistics error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener las estadísticas',
      });
    }
  }

  /**
   * Get customer invoices
   * @route GET /api/invoices/customer/:customerId
   */
  async getCustomerInvoices(req, res) {
    try {
      const { customerId } = req.params;
      const currentUser = req.user;

      const invoices = await invoiceService.getCustomerInvoices(customerId, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Facturas del cliente obtenidas correctamente',
        data: { invoices },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get customer invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener las facturas del cliente',
      });
    }
  }

  /**
   * Export invoices
   * @route POST /api/incoming-orders/export
   */
  async exportInvoices(req, res) {
    try {
      const { invoices, consecutive } = req.body;
      const currentUser = req.user;

      // Validate required fields
      if (!invoices || !Array.isArray(invoices) || invoices.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El arreglo de facturas es obligatorio y no puede estar vacío',
        });
      }

      if (consecutive !== undefined && typeof consecutive !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'El consecutivo debe ser un número',
        });
      }

      const result = await invoiceService.exportInvoices(invoices, consecutive, req.companyId, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Facturas exportadas correctamente',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Export invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al exportar las facturas',
      });
    }
  }
}

export default new InvoiceController();
