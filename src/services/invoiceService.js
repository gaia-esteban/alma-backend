import { Op } from 'sequelize';
import invoiceRepository from '../repositories/invoiceRepository.js';
import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';

/**
 * Invoice Service - Business Logic Layer
 */
class InvoiceService {
  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data
   * @param {Array} details - Invoice details
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(invoiceData, details = [], currentUser) {
    try {
      // Verify customer exists
      const customer = await userRepository.findById(invoiceData.customerId);
      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // Check if invoice number already exists
      const existingInvoice = await invoiceRepository.findByInvoiceNumber(
        invoiceData.invoiceNumber
      );
      if (existingInvoice) {
        throw new Error('El número de factura ya existe');
      }

      // Calculate total amount from details
      let totalAmount = 0;
      if (details && details.length > 0) {
        totalAmount = details.reduce((sum, detail) => {
          return sum + (parseFloat(detail.quantity) * parseFloat(detail.unitPrice));
        }, 0);
      }

      // Create invoice with calculated total
      const invoice = await invoiceRepository.create(
        {
          ...invoiceData,
          totalAmount: invoiceData.totalAmount || totalAmount,
        },
        details
      );

      logger.info(`Invoice created: ${invoice.invoiceNumber} by user ${currentUser.username}`);
      return invoice;
    } catch (error) {
      logger.error({ err: error }, 'Error creating invoice');
      throw error;
    }
  }

  /**
   * Get all invoices
   * @param {Object} filters - Filter options
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Invoices list with pagination
   */
  async getAllInvoices(filters = {}, currentUser) {
    try {
      const { page = 1, limit = 10, orderBy = 'DESC', status, companyIds } = filters;
      const offset = (page - 1) * limit;

      // Validate orderBy parameter
      const validOrderBy = ['ASC', 'DESC'];
      const sortOrder = validOrderBy.includes(orderBy.toUpperCase())
        ? orderBy.toUpperCase()
        : 'DESC';

      const where = { companyId: { [Op.in]: companyIds } };
      if (status) where.status = status;

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy: sortOrder,
        include: [{ association: 'company', attributes: ['id', 'description'] }],
      };

      const invoices = await invoiceRepository.findAll(options);
      const total = await invoiceRepository.count(where);

      logger.info(`Retrieved ${invoices.length} invoices for user ${currentUser.username}`);

      return {
        data: invoices,
        total,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all invoices');
      throw error;
    }
  }

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Invoice data with details
   */
  async getInvoiceById(id, companyIds, currentUser) {
    try {
      const invoice = await invoiceRepository.findByIdWithDetails(id);
      if (!invoice || !companyIds.includes(String(invoice.companyId))) {
        throw new Error('Factura no encontrada');
      }

      logger.info(`Retrieved invoice: ${invoice.number} by user ${currentUser.username}`);

      return {
        data: invoice,
        total: 1,
      };
    } catch (error) {
      logger.error({ err: error }, `Error getting invoice by ID ${id}`);
      throw error;
    }
  }

  /**
   * Get invoice by invoice number
   * @param {string} invoiceNumber - Invoice number
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Invoice data
   */
  async getInvoiceByNumber(invoiceNumber, currentUser) {
    try {
      const invoice = await invoiceRepository.findByInvoiceNumber(invoiceNumber);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Check permissions
      if (currentUser.role !== 'admin' && invoice.customerId !== currentUser.id) {
        throw new Error('No tienes permiso para ver esta factura');
      }

      logger.info(`Retrieved invoice: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error({ err: error }, `Error getting invoice by number ${invoiceNumber}`);
      throw error;
    }
  }

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} updates - Update data
   * @param {Array} details - Updated invoice details
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoice(id, updates, details = null, currentUser) {
    try {
      const invoice = await invoiceRepository.findById(id);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Check permissions
      if (currentUser.role !== 'admin' && invoice.customerId !== currentUser.id) {
        throw new Error('No tienes permiso para actualizar esta factura');
      }

      // Don't allow updating paid or cancelled invoices
      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        throw new Error(`No se puede actualizar una factura en estado ${invoice.status}`);
      }

      // If customerId is being updated, verify new customer exists
      if (updates.customerId && updates.customerId !== invoice.customerId) {
        const customer = await userRepository.findById(updates.customerId);
        if (!customer) {
          throw new Error('Cliente no encontrado');
        }
      }

      // If invoice number is being updated, check for duplicates
      if (updates.invoiceNumber && updates.invoiceNumber !== invoice.invoiceNumber) {
        const existingInvoice = await invoiceRepository.findByInvoiceNumber(
          updates.invoiceNumber
        );
        if (existingInvoice) {
          throw new Error('El número de factura ya existe');
        }
      }

      // Calculate new total if details are provided
      if (details !== null && details.length > 0) {
        const totalAmount = details.reduce((sum, detail) => {
          return sum + (parseFloat(detail.quantity) * parseFloat(detail.unitPrice));
        }, 0);
        updates.totalAmount = totalAmount;
      }

      const updatedInvoice = await invoiceRepository.updateWithDetails(id, updates, details);
      logger.info(`Invoice updated: ${updatedInvoice.invoiceNumber} by user ${currentUser.username}`);

      return updatedInvoice;
    } catch (error) {
      logger.error({ err: error }, `Error updating invoice ${id}`);
      throw error;
    }
  }

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteInvoice(id, currentUser) {
    try {
      const invoice = await invoiceRepository.findById(id);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Only admins can delete invoices
      if (currentUser.role !== 'admin') {
        throw new Error('Solo los administradores pueden eliminar facturas');
      }

      // Don't allow deleting paid invoices
      if (invoice.status === 'paid') {
        throw new Error('No se puede eliminar una factura pagada');
      }

      await invoiceRepository.delete(id);
      logger.info(`Invoice deleted: ${invoice.invoiceNumber} by user ${currentUser.username}`);

      return {
        message: 'Factura eliminada correctamente',
      };
    } catch (error) {
      logger.error({ err: error }, `Error deleting invoice ${id}`);
      throw error;
    }
  }

  /**
   * Update invoice status
   * @param {string} id - Invoice ID
   * @param {string} status - New status
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoiceStatus(id, status, companyId, currentUser) {
    try {
      const invoice = await invoiceRepository.findById(id);
      if (!invoice || String(invoice.companyId) !== companyId) {
        throw new Error('Factura no encontrada');
      }

      // Validate status transition
      const validStatuses = ['Pendiente', 'Procesada', 'Fallida'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
      }

      const updatedInvoice = await invoiceRepository.update(id, { status });
      logger.info(`Invoice status updated: ${invoice.invoiceNumber} -> ${status}`);

      return updatedInvoice;
    } catch (error) {
      logger.error({ err: error }, `Error updating invoice status ${id}`);
      throw error;
    }
  }

  /**
   * Get invoice statistics
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Invoice statistics
   */
  async getInvoiceStatistics(currentUser) {
    try {
      let whereClause = {};

      // If not admin, only get stats for user's invoices
      if (currentUser.role !== 'admin') {
        whereClause.customerId = currentUser.id;
      }

      const totalInvoices = await invoiceRepository.count(whereClause);
      const draftInvoices = await invoiceRepository.count({ ...whereClause, status: 'draft' });
      const pendingInvoices = await invoiceRepository.count({ ...whereClause, status: 'pending' });
      const paidInvoices = await invoiceRepository.count({ ...whereClause, status: 'paid' });
      const cancelledInvoices = await invoiceRepository.count({ ...whereClause, status: 'cancelled' });
      const totalAmount = await invoiceRepository.calculateTotalAmount(whereClause);
      const paidAmount = await invoiceRepository.calculateTotalAmount({ ...whereClause, status: 'paid' });
      const pendingAmount = await invoiceRepository.calculateTotalAmount({ ...whereClause, status: 'pending' });

      logger.info(`Retrieved invoice statistics for user ${currentUser.username}`);

      return {
        total: totalInvoices,
        draft: draftInvoices,
        pending: pendingInvoices,
        paid: paidInvoices,
        cancelled: cancelledInvoices,
        totalAmount: parseFloat(totalAmount).toFixed(2),
        paidAmount: parseFloat(paidAmount).toFixed(2),
        pendingAmount: parseFloat(pendingAmount).toFixed(2),
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting invoice statistics');
      throw error;
    }
  }

  /**
   * Get customer invoices
   * @param {string} customerId - Customer ID
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Array>} Customer invoices
   */
  async getCustomerInvoices(customerId, currentUser) {
    try {
      // Check permissions
      if (currentUser.role !== 'admin' && customerId !== currentUser.id) {
        throw new Error('No tienes permiso para ver estas facturas');
      }

      const invoices = await invoiceRepository.findByCustomerId(customerId);
      logger.info(`Retrieved ${invoices.length} invoices for customer ${customerId}`);

      return invoices;
    } catch (error) {
      logger.error({ err: error }, `Error getting customer invoices for ${customerId}`);
      throw error;
    }
  }

  /**
   * Export invoices
   * @param {Array<string>} invoiceIds - Array of invoice IDs to export
   * @param {string} consecutive - Consecutive identifier for the export
   * @param {string} companyId - Company ID the invoices must belong to
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Export result
   */
  async exportInvoices(invoices, consecutive, companyId, currentUser) {
    try {
      const ids = invoices.map((invoice) => invoice.id).filter((id) => id !== undefined);
      const found = await invoiceRepository.findAll({ where: { id: { [Op.in]: ids } } });
      const mismatched = found.filter((invoice) => String(invoice.companyId) !== companyId);
      if (found.length !== ids.length || mismatched.length > 0) {
        throw new Error('Una o más facturas no pertenecen a la compañía especificada');
      }

      const { default: mailboxReaderHelper } = await import(
        './helpers/mailboxReaderHelper.js'
      );
      const response = await mailboxReaderHelper.callContaiExport(
        invoices,
        consecutive,
        { userEmail: currentUser?.email, userName: currentUser?.name }
      );

      logger.info(
        `Exported ${invoices.length} invoices with consecutive ${consecutive}`
      );

      return response;
    } catch (error) {
      logger.error({ err: error }, 'Error exporting invoices');
      throw error;
    }
  }
}

export default new InvoiceService();
