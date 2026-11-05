import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

// Inbound mailbox providers and their required fields. Mirrors the provider
// validators in alma-mailbox-reader (src/services/providers/*Client.js isValid),
// which is what actually consumes company.mailbox_configs — keep them in sync.
export const MAILBOX_PROVIDERS = Object.freeze({
  'microsoft-graph': Object.freeze(['tenantId', 'clientId', 'clientSecret', 'mailboxUser']),
  gmail: Object.freeze(['clientId', 'clientSecret', 'refreshToken', 'mailboxUser']),
});

// Credential fields that are write-only: redacted on read, preserved on PATCH
// when the client sends the redaction mask back (see companyService).
export const MAILBOX_SECRET_FIELDS = Object.freeze(['clientSecret', 'refreshToken']);

function validateMailboxEntry(entry, index) {
  const path = `mailbox_configs[${index}]`;

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(`${path} must be an object`);
  }

  const requiredFields = MAILBOX_PROVIDERS[entry.provider];
  if (!requiredFields) {
    throw new Error(`${path}.provider must be one of: ${Object.keys(MAILBOX_PROVIDERS).join(', ')}`);
  }

  for (const field of requiredFields) {
    if (typeof entry[field] !== 'string' || !entry[field].trim()) {
      throw new Error(`${path}.${field} is required and must be a non-empty string`);
    }
  }

  if (entry.enabled !== undefined && typeof entry.enabled !== 'boolean') {
    throw new Error(`${path}.enabled must be a boolean`);
  }
}

function validateMailboxConfigs(value) {
  if (!Array.isArray(value)) {
    throw new Error('mailbox_configs must be an array');
  }

  const seen = new Set();
  value.forEach((entry, index) => {
    validateMailboxEntry(entry, index);
    const key = entry.mailboxUser.trim().toLowerCase();
    if (seen.has(key)) {
      throw new Error(`mailbox_configs[${index}].mailboxUser "${entry.mailboxUser}" is duplicated`);
    }
    seen.add(key);
  });
}

export const ACCOUNTING_SYSTEMS = Object.freeze({
  CONTAI: 'contai',
  SIIGO: 'siigo',
});

// Siigo accounting_config shape (mirrored in alma-mailbox-reader src/domain/accounting-system.js):
// {
//   url: "https://api.siigo.com", username, accessKey, partnerId,
//   purchaseDocumentId: 24446,                         // Siigo voucher type for purchase invoices
//   endpoints: { purchases: "/v1/purchases", suppliers: "/v1/customers" },
//   costCenterId: 235,                                 // optional, if the voucher requires it
//   taxes: [{ type: "IVA", percentage: 19, id: 13156 }, { type: "Retefuente", percentage: 2.5, id: 1234 }],
//   paymentTypes: { contado: 5636, credito: 5637 }     // keyed by DIAN PaymentMeans/ID (1=contado, 2=crédito)
// }
export const SIIGO_TAX_TYPES = Object.freeze([
  'IVA', 'Retefuente', 'ReteIVA', 'ReteICA', 'Impoconsumo', 'AdValorem', 'Autorretencion',
]);

const SIIGO_STRING_FIELDS = ['url', 'username', 'accessKey', 'partnerId'];
const SIIGO_ENDPOINTS = ['purchases', 'suppliers'];
const SIIGO_PAYMENT_TYPES = ['contado', 'credito'];

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

export function getSiigoConfigErrors(value) {
  if (!isPlainObject(value)) {
    return ['accounting_config is required when accounting_system is siigo'];
  }

  const errors = [];

  for (const field of SIIGO_STRING_FIELDS) {
    if (!isNonEmptyString(value[field])) errors.push(`accounting_config.${field} must be a non-empty string`);
  }

  if (isNonEmptyString(value.url)) {
    try {
      const { protocol } = new URL(value.url);
      if (protocol !== 'https:' && protocol !== 'http:') errors.push('accounting_config.url must use http or https');
    } catch {
      errors.push('accounting_config.url must be a valid URL');
    }
  }

  if (!isPositiveInt(value.purchaseDocumentId)) {
    errors.push('accounting_config.purchaseDocumentId must be a positive integer');
  }

  if (value.costCenterId !== undefined && value.costCenterId !== null && !isPositiveInt(value.costCenterId)) {
    errors.push('accounting_config.costCenterId must be a positive integer when set');
  }

  if (!isPlainObject(value.endpoints)) {
    errors.push(`accounting_config.endpoints must be an object with: ${SIIGO_ENDPOINTS.join(', ')}`);
  } else {
    for (const key of SIIGO_ENDPOINTS) {
      if (!isNonEmptyString(value.endpoints[key]) || !value.endpoints[key].startsWith('/')) {
        errors.push(`accounting_config.endpoints.${key} must be a path starting with "/"`);
      }
    }
  }

  if (!Array.isArray(value.taxes) || value.taxes.length === 0) {
    errors.push('accounting_config.taxes must be a non-empty array of { type, percentage, id }');
  } else {
    const seen = new Set();
    value.taxes.forEach((tax, i) => {
      if (!isPlainObject(tax)) {
        errors.push(`accounting_config.taxes[${i}] must be an object`);
        return;
      }
      if (!SIIGO_TAX_TYPES.includes(tax.type)) {
        errors.push(`accounting_config.taxes[${i}].type must be one of: ${SIIGO_TAX_TYPES.join(', ')}`);
      }
      if (typeof tax.percentage !== 'number' || !Number.isFinite(tax.percentage) || tax.percentage < 0) {
        errors.push(`accounting_config.taxes[${i}].percentage must be a number >= 0`);
      }
      if (!isPositiveInt(tax.id)) {
        errors.push(`accounting_config.taxes[${i}].id must be a positive integer`);
      }
      const key = `${tax.type}:${tax.percentage}`;
      if (seen.has(key)) errors.push(`accounting_config.taxes has a duplicate entry for ${key}`);
      seen.add(key);
    });
  }

  if (!isPlainObject(value.paymentTypes)) {
    errors.push(`accounting_config.paymentTypes must be an object with: ${SIIGO_PAYMENT_TYPES.join(', ')}`);
  } else {
    for (const key of SIIGO_PAYMENT_TYPES) {
      if (!isPositiveInt(value.paymentTypes[key])) {
        errors.push(`accounting_config.paymentTypes.${key} must be a positive integer`);
      }
    }
  }

  return errors;
}

function validateSiigoConfig(value) {
  const errors = getSiigoConfigErrors(value);
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
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
    // Inbound mailboxes polled by alma-mailbox-reader; any number per company.
    // Migration: scripts/migrate_mailbox_config_to_array.sql (replaces the old
    // single-object mailbox_config column).
    mailbox_configs: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidMailboxConfigs: validateMailboxConfigs,
      },
    },
    onedrive_folder: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    accounting_system: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ACCOUNTING_SYSTEMS.CONTAI,
      validate: {
        isIn: {
          args: [Object.values(ACCOUNTING_SYSTEMS)],
          msg: `accounting_system must be one of: ${Object.values(ACCOUNTING_SYSTEMS).join(', ')}`,
        },
      },
    },
    accounting_config: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Company',
    tableName: 'company',
    timestamps: true,
    validate: {
      // Model-level so it sees the merged instance on PATCH: switching to siigo
      // without credentials, or blanking credentials on a siigo company, fails.
      // For contai the config is ignored (kept so toggling back doesn't lose it).
      accountingConfigMatchesSystem() {
        if (this.accounting_system === ACCOUNTING_SYSTEMS.SIIGO) {
          validateSiigoConfig(this.accounting_config);
        }
      },
    },
  }
);

export default Company;
