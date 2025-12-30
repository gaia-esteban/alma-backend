import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class IncomingInvoice extends Model {
  /**
   * Check if invoice is overdue
   * @returns {boolean}
   */
  isOverdue() {
    return new Date() > new Date(this.dueDate);
  }

  /**
   * Calculate total value (gross + tax)
   * @returns {number}
   */
  calculateTotal() {
    const gross = parseFloat(this.grossValue) || 0;
    const tax = parseFloat(this.taxValue) || 0;
    return gross + tax;
  }
}

IncomingInvoice.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'number',
    },
    issuanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'issuance_date',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    purchaseOrder: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'purchase_order',
    },
    paymentMethod: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_method',
    },
    paymentForm: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_form',
    },
    currency: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'currency',
    },
    supplier: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'supplier',
    },
    supplierId: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'supplier_id',
    },
    accountingNumber: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'accounting_number',
    },
    costCenter: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cost_center',
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'company_id',
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    grossValue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'gross_value',
    },
    taxValue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'tax_value',
    },
    totalValue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'total_value',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'IncomingInvoice',
    tableName: 'ininvoicemaster',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['company_id'],
      },
      {
        fields: ['supplier_id'],
      },
      {
        fields: ['number'],
      },
      {
        fields: ['issuance_date'],
      },
    ],
  }
);

export default IncomingInvoice;
