import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Company from './Company.js';

class Supplier extends Model {
  toJSON() {
    return { ...this.get() };
  }
}

Supplier.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: { msg: 'company_id is required' },
      },
    },
    identification: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'identification is required' },
        notEmpty: { msg: 'identification cannot be empty' },
        len: {
          args: [1, 100],
          msg: 'identification must be between 1 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    debit_account: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    credit_account: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tax_vat_account: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    withholdings_account: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    withholdings_threshold: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    withholdings_percentage: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'supplier',
    timestamps: true,
  }
);

Supplier.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company',
});

Company.hasMany(Supplier, {
  foreignKey: 'company_id',
  as: 'suppliers',
});

export default Supplier;
