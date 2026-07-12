import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export const ENTITY = Object.freeze({
  INCOMING_ORDER: 'INCOMING_ORDER',
  APP: 'APP',
  SUPPLIER: 'SUPPLIER',
});

export const EVENT_NAME = Object.freeze({
  LOGGED_IN: 'LOGGED_IN',
  ACCOUNTING_FILE_CREATED: 'ACCOUNTING_FILE_CREATED',
  SUPPLIER_UPDATED: 'SUPPLIER_UPDATED',
});

export const OUTCOME = Object.freeze({
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS',
});

class EventLog extends Model {
  toJSON() {
    return { ...this.get() };
  }
}

EventLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    entity: {
      type: DataTypes.ENUM(...Object.values(ENTITY)),
      allowNull: false,
      validate: {
        notNull: { msg: 'entity is required' },
        isIn: {
          args: [Object.values(ENTITY)],
          msg: `entity must be one of: ${Object.values(ENTITY).join(', ')}`,
        },
      },
    },
    eventName: {
      type: DataTypes.ENUM(...Object.values(EVENT_NAME)),
      allowNull: false,
      field: 'event_name',
      validate: {
        notNull: { msg: 'event_name is required' },
        isIn: {
          args: [Object.values(EVENT_NAME)],
          msg: `event_name must be one of: ${Object.values(EVENT_NAME).join(', ')}`,
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
    },
    userEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'user_email',
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'company_id',
      references: {
        model: 'company',
        key: 'id',
      },
    },
    outcome: {
      type: DataTypes.ENUM(...Object.values(OUTCOME)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(OUTCOME)],
          msg: `outcome must be one of: ${Object.values(OUTCOME).join(', ')}`,
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'EventLog',
    tableName: 'events_log',
    timestamps: true,
    updatedAt: false,
  }
);

export default EventLog;
