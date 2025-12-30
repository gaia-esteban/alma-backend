import IncomingInvoice from '../models/IncomingInvoice.js';
import IncomingInvoiceDetails from '../models/IncomingInvoiceDetails.js';
import logger from '../utils/logger.js';

/**
 * Invoice Repository - Data Access Layer
 */
class InvoiceRepository {
  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<IncomingInvoice>}
   */
  async create(invoiceData) {
    try {
      const invoice = await IncomingInvoice.create(invoiceData);
      logger.info(`Invoice created: ${invoice.number}`);
      return await this.findById(invoice.id);
    } catch (error) {
      logger.error({ err: error }, 'Error creating invoice');
      throw error;
    }
  }

  /**
   * Bulk create invoices
   * @param {Array} invoicesData - Array of invoice data
   * @returns {Promise<IncomingInvoice[]>}
   */
  async bulkCreate(invoicesData) {
    try {
      const invoices = await IncomingInvoice.bulkCreate(invoicesData);
      logger.info(`${invoices.length} invoices created in bulk`);
      return invoices;
    } catch (error) {
      logger.error({ err: error }, 'Error bulk creating invoices');
      throw error;
    }
  }

  /**
   * Find invoice by ID
   * @param {number} id - Invoice ID
   * @returns {Promise<IncomingInvoice|null>}
   */
  async findById(id) {
    try {
      return await IncomingInvoice.findByPk(id);
    } catch (error) {
      logger.error({ err: error }, `Error finding invoice by ID ${id}`);
      throw error;
    }
  }

  /**
   * Find invoice by ID with details
   * @param {number} id - Invoice ID
   * @returns {Promise<IncomingInvoice|null>}
   */
  async findByIdWithDetails(id) {
    try {
      return await IncomingInvoice.findByPk(id, {
        include: [
          {
            model: IncomingInvoiceDetails,
            as: 'details',
          },
        ],
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding invoice by ID with details ${id}`);
      throw error;
    }
  }

  /**
   * Find invoice by number
   * @param {string} number - Invoice number
   * @returns {Promise<IncomingInvoice|null>}
   */
  async findByNumber(number) {
    try {
      return await IncomingInvoice.findOne({
        where: { number },
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding invoice by number ${number}`);
      throw error;
    }
  }

  /**
   * Find all invoices
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findAll(options = {}) {
    try {
      const { orderBy = 'DESC', ...otherOptions } = options;
      return await IncomingInvoice.findAll({
        ...otherOptions,
        order: [['createdAt', orderBy]],
      });
    } catch (error) {
      logger.error({ err: error }, 'Error finding all invoices');
      throw error;
    }
  }

  /**
   * Find invoices by company ID
   * @param {number} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findByCompanyId(companyId, options = {}) {
    try {
      return await IncomingInvoice.findAll({
        ...options,
        where: { companyId },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding invoices by company ${companyId}`);
      throw error;
    }
  }

  /**
   * Find invoices by supplier ID
   * @param {string} supplierId - Supplier ID
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findBySupplierId(supplierId, options = {}) {
    try {
      return await IncomingInvoice.findAll({
        ...options,
        where: { supplierId },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding invoices by supplier ${supplierId}`);
      throw error;
    }
  }

  /**
   * Find invoices by purchase order
   * @param {string} purchaseOrder - Purchase order reference
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findByPurchaseOrder(purchaseOrder, options = {}) {
    try {
      return await IncomingInvoice.findAll({
        ...options,
        where: { purchaseOrder },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error({ err: error }, `Error finding invoices by purchase order ${purchaseOrder}`);
      throw error;
    }
  }

  /**
   * Find overdue invoices
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findOverdue(options = {}) {
    try {
      const { Op } = await import('sequelize');
      return await IncomingInvoice.findAll({
        ...options,
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
        },
        order: [['dueDate', 'ASC']],
      });
    } catch (error) {
      logger.error({ err: error }, 'Error finding overdue invoices');
      throw error;
    }
  }

  /**
   * Update invoice
   * @param {number} id - Invoice ID
   * @param {Object} updates - Update data
   * @returns {Promise<IncomingInvoice|null>}
   */
  async update(id, updates) {
    try {
      const invoice = await IncomingInvoice.findByPk(id);
      if (!invoice) {
        return null;
      }
      await invoice.update(updates);
      logger.info(`Invoice updated: ${invoice.number}`);
      return await this.findById(invoice.id);
    } catch (error) {
      logger.error({ err: error }, `Error updating invoice ${id}`);
      throw error;
    }
  }

  /**
   * Delete invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      const invoice = await IncomingInvoice.findByPk(id);
      if (!invoice) {
        return false;
      }
      await invoice.destroy();
      logger.info(`Invoice deleted: ${invoice.number}`);
      return true;
    } catch (error) {
      logger.error({ err: error }, `Error deleting invoice ${id}`);
      throw error;
    }
  }

  /**
   * Count invoices
   * @param {Object} where - Where conditions
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    try {
      return await IncomingInvoice.count({ where });
    } catch (error) {
      logger.error({ err: error }, 'Error counting invoices');
      throw error;
    }
  }

  /**
   * Calculate total value for invoices
   * @param {Object} where - Where conditions
   * @returns {Promise<Object>}
   */
  async calculateTotals(where = {}) {
    try {
      const invoices = await IncomingInvoice.findAll({ where });
      return invoices.reduce((totals, invoice) => {
        totals.grossValue += parseFloat(invoice.grossValue) || 0;
        totals.taxValue += parseFloat(invoice.taxValue) || 0;
        totals.totalValue += parseFloat(invoice.totalValue) || 0;
        return totals;
      }, { grossValue: 0, taxValue: 0, totalValue: 0 });
    } catch (error) {
      logger.error({ err: error }, 'Error calculating total amounts');
      throw error;
    }
  }

  /**
   * Find invoices by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<IncomingInvoice[]>}
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { Op } = await import('sequelize');
      return await IncomingInvoice.findAll({
        ...options,
        where: {
          issuanceDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['issuanceDate', 'DESC']],
      });
    } catch (error) {
      logger.error({ err: error }, 'Error finding invoices by date range');
      throw error;
    }
  }
}

export default new InvoiceRepository();
