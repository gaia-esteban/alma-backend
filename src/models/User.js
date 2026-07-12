import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {
  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Check if user has access to a given company
   * @param {number|string} companyId
   * @returns {boolean}
   */
  hasCompanyAccess(companyId) {
    return this.isAdmin() || this.company_access.includes(String(companyId));
  }

  /**
   * Convert user to JSON
   * @returns {Object}
   */
  toJSON() {
    return { ...this.get() };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is required' },
        notEmpty: { msg: 'Name cannot be empty' },
        len: {
          args: [3, 50],
          msg: 'Name must be between 3 and 50 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email cannot be empty' },
        isEmail: { msg: 'Must be a valid email address' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'qrgen',
      allowNull: false,
    },
    otpkey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_access: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notNull: { msg: 'company_access is required' },
        isNonEmptyArray(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('company_access must contain at least one company id');
          }
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
