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
          message: 'Invoice number and customer ID are required',
        });
      }

      const result = await invoiceService.createInvoice(invoice, details || [], currentUser);

      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: { invoice: result },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create invoice',
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
        customerId: req.query.customerId,
      };
      const currentUser = req.user;

      const result = await invoiceService.getAllInvoices(filters, currentUser);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve invoices',
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

      const result = await invoiceService.getInvoiceById(id, currentUser);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get invoice by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Invoice not found',
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
        message: 'Invoice retrieved successfully',
        data: { invoice },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get invoice by number error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Invoice not found',
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
        message: 'Invoice updated successfully',
        data: { invoice: result },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update invoice',
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
        message: 'Invoice deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Delete invoice error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete invoice',
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
          message: 'Status is required',
        });
      }

      const invoice = await invoiceService.updateInvoiceStatus(id, status, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Invoice status updated successfully',
        data: { invoice },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update invoice status error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update invoice status',
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
        message: 'Invoice statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error({ err: error }, 'Get invoice statistics error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve statistics',
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
        message: 'Customer invoices retrieved successfully',
        data: { invoices },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get customer invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve customer invoices',
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
          message: 'invoices array is required and must not be empty',
        });
      }

      if (!consecutive || typeof consecutive !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'consecutive string is required',
        });
      }

      const result = await invoiceService.exportInvoices(invoices, consecutive, currentUser);

      return res.status(200).json({
        success: true,
        message: 'Invoices exported successfully',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Export invoices error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to export invoices',
      });
    }
  }
}

export default new InvoiceController();
