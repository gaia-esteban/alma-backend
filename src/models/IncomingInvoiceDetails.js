import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import IncomingInvoice from './IncomingInvoice.js';

class IncomingInvoiceDetails extends Model {
  /**
   * Calculate line total price
   * @returns {number}
   */
  calculateTotalPrice() {
    const quantity = parseFloat(this.quantity) || 0;
    const unitPrice = parseFloat(this.unitPrice) || 0;
    const discount = parseFloat(this.discount) || 0;

    return (quantity * unitPrice) - discount;
  }
}

IncomingInvoiceDetails.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    invoiceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'invoice_id',
      references: {
        model: 'ininvoicemaster',
        key: 'id',
      },
      validate: {
        notNull: { msg: 'Invoice ID is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'unit_price',
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'total_price',
    },
    discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'IncomingInvoiceDetails',
    tableName: 'ininvoicedetails',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      beforeValidate: (detail) => {
        // Auto-calculate total_price before validation if quantity and unitPrice are present
        if (detail.quantity && detail.unitPrice) {
          const quantity = parseFloat(detail.quantity) || 0;
          const unitPrice = parseFloat(detail.unitPrice) || 0;
          const discount = parseFloat(detail.discount) || 0;
          detail.totalPrice = (quantity * unitPrice) - discount;
        }
      },
    },
    indexes: [
      {
        fields: ['invoice_id'],
      },
    ],
  }
);

// Define associations
IncomingInvoiceDetails.belongsTo(IncomingInvoice, {
  foreignKey: 'invoiceId',
  as: 'invoice',
  onDelete: 'CASCADE',
});

IncomingInvoice.hasMany(IncomingInvoiceDetails, {
  foreignKey: 'invoiceId',
  as: 'details',
  onDelete: 'CASCADE',
});

export default IncomingInvoiceDetails;
