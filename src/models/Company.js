import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export const MAILBOX_CLIENTS = Object.freeze(['microsoft', 'google']);

function validateMailboxConfig(value) {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('mailbox_config must be an object');
  }

  const requiredFields = ['client', 'clientId', 'tenantId', 'mailboxUser', 'clientSecret'];
  for (const field of requiredFields) {
    if (typeof value[field] !== 'string' || !value[field].trim()) {
      throw new Error(`mailbox_config.${field} is required and must be a non-empty string`);
    }
  }

  if (!MAILBOX_CLIENTS.includes(value.client)) {
    throw new Error(`mailbox_config.client must be one of: ${MAILBOX_CLIENTS.join(', ')}`);
  }
}

class Company extends Model {
  toJSON() {
    return { ...this.get() };
  }
}

Company.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'description is required' },
        notEmpty: { msg: 'description cannot be empty' },
      },
    },
    accounts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    documentsnumber: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    mailbox_config: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidMailboxConfig: validateMailboxConfig,
      },
    },
    onedrive_folder: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Company',
    tableName: 'company',
    timestamps: true,
  }
);

export default Company;
