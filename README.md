# AlMa Backend - Node.js REST API

A modern Node.js backend built with Express, Sequelize ORM, JWT authentication, and TOTP-based two-factor authentication.

## Features

- **ES6 Modules**: Modern JavaScript with import/export syntax
- **Express.js**: Fast, unopinionated web framework
- **Sequelize ORM**: Database management with PostgreSQL
- **JWT Authentication**: Secure token-based authentication
- **Pino Logger**: High-performance structured logging
- **CORS**: Cross-Origin Resource Sharing support
- **Layered Architecture**: Controllers, Services, Repositories pattern

## Project Structure

```
backend-nodejs-alma/
├── src/
│   ├── config/
│   │   ├── env.js                     # Environment configuration loader
│   │   └── database.js                # Sequelize setup and connection
│   ├── utils/
│   │   └── logger.js                  # Pino logger configuration
│   ├── models/
│   │   ├── User.js                    # User model
│   │   ├── IncomingInvoice.js         # Incoming invoice model
│   │   ├── IncomingInvoiceDetails.js  # Invoice line items model
│   │   ├── Supplier.js                # Supplier model
│   │   └── EventLog.js                # Audit event log model
│   ├── repositories/
│   │   ├── userRepository.js          # User data access layer
│   │   ├── invoiceRepository.js       # Invoice data access layer
│   │   ├── supplierRepository.js      # Supplier data access layer
│   │   └── eventLogRepository.js      # Event log data access layer
│   ├── services/
│   │   ├── authService.js             # Authentication service (JWT)
│   │   ├── userService.js             # User business logic
│   │   ├── invoiceService.js          # Invoice business logic
│   │   ├── supplierService.js         # Supplier business logic
│   │   ├── eventLogService.js         # Event log business logic
│   │   ├── emailService.js            # Email sending service
│   │   └── emailTemplates.js          # Email template helpers
│   ├── controllers/
│   │   ├── authController.js          # Authentication endpoints
│   │   ├── userController.js          # User CRUD endpoints
│   │   ├── invoiceController.js       # Incoming order endpoints
│   │   ├── supplierController.js      # Supplier endpoints
│   │   └── eventLogController.js      # Event log endpoints
│   ├── middlewares/
│   │   ├── auth.js                    # JWT authentication & authorization
│   │   └── cors.js                    # CORS configuration
│   ├── routes/
│   │   └── index.js                   # API routes configuration
│   └── index.js                       # Application entry point
├── scripts/
│   ├── create_events_log.sql          # Initial events_log table migration
│   └── alter_events_log_add_outcome.sql # Add outcome column migration
├── .env                               # Environment variables
├── package.json                       # Project dependencies
└── README.md                          # This file
```

## Prerequisites

- Node.js 18+ (with ES modules support)
- PostgreSQL 14+
- npm or yarn

## Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd backend-nodejs-alma
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env` and update with your configuration
   - Update database credentials
   - Generate a secure JWT secret
   - Configure CORS origins

4. Create the database and run migrations:
   ```sql
   CREATE DATABASE alma_db;
   ```
   Then run the migration scripts in order:
   ```bash
   psql -d alma_db -f scripts/create_events_log.sql
   psql -d alma_db -f scripts/alter_events_log_add_outcome.sql
   ```

5. Run the application:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env` file for all configuration options. Key variables:

- `PORT`: Server port (default: 3000)
- `DB_*`: Database connection settings
- `JWT_SECRET`: Secret key for JWT tokens
- `TOTP_ISSUER`: Issuer name for TOTP (appears in authenticator apps)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Incoming Orders
- `GET /api/incoming-orders` - Get all incoming orders
- `GET /api/incoming-orders/:id` - Get incoming order by ID
- `POST /api/incoming-orders/export` - Export incoming orders
- `PATCH /api/incoming-orders/:id/status` - Update order status

### Suppliers

All supplier endpoints require a Bearer token: `Authorization: Bearer <token>`

---

#### `GET /api/suppliers`
List suppliers with optional filters.

**Query params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `company_id` | number | No | Filter by company |
| `is_active` | boolean | No | Filter by active status |
| `identification` | string | No | Filter by exact identification value |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 10) |

**Response:**
```json
{
  "data": [ { ...supplier } ],
  "total": 42
}
```

---

#### `GET /api/suppliers/:id`
Get a single supplier by ID.

**Path params:**
| Param | Type | Description |
|---|---|---|
| `id` | number | Supplier ID |

**Response:**
```json
{
  "success": true,
  "message": "Supplier retrieved successfully",
  "data": { "supplier": { ...supplier } }
}
```

---

#### `POST /api/suppliers`
Create a new supplier.

**Body (JSON):**
| Field | Type | Required | Description |
|---|---|---|---|
| `company_id` | number | Yes | Company the supplier belongs to |
| `identification` | string | Yes | Supplier identifier (max 100 chars). Must be unique per company |
| `description` | string | No | Free-text description (max 250 chars) |
| `debit_account` | string | No | Debit account code (max 50 chars) |
| `credit_account` | string | No | Credit account code (max 50 chars) |
| `tax_vat_account` | string | No | VAT account code (max 50 chars) |
| `withholdings_account` | string | No | Withholdings account code (max 255 chars) |
| `withholding_account` | string | No | Withholding account code (max 50 chars) |
| `withholdings_threshold` | number | No | Withholding threshold amount |
| `withholdings_percentage` | number | No | Withholding percentage |
| `is_active` | boolean | No | Active status (default: true) |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": { "supplier": { ...supplier } }
}
```

---

#### `PATCH /api/suppliers/:id`
Partially update an existing supplier. Only include the fields to change.

**Path params:**
| Param | Type | Description |
|---|---|---|
| `id` | number | Supplier ID |

**Body (JSON):** Any subset of the fields listed in `POST /api/suppliers`.

**Response:**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": { "supplier": { ...supplier } }
}
```

### Event Log

`GET` endpoints require a Bearer token: `Authorization: Bearer <token>`
`POST` endpoint requires an API key: `x-api-key: <EVENTS_LOG_API_KEY>`

---

#### `GET /api/events-log`
List event log entries with optional filters.

**Query params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `entity` | string | No | Filter by entity. Values: `INCOMING_ORDER`, `APP`, `SUPPLIER` |
| `eventName` | string | No | Filter by event. Values: `LOGGED_IN`, `ACCOUNTING_FILE_CREATED`, `SUPPLIER_UPDATED` |
| `userId` | number | No | Filter by user ID |
| `userEmail` | string | No | Filter by user email (exact match) |
| `startDate` | ISO 8601 string | No | Filter records created on or after this date. Use full timestamp (e.g. `2026-06-01T00:00:00Z`) for precision |
| `endDate` | ISO 8601 string | No | Filter records created on or before this date. A bare date like `2026-06-14` resolves to midnight UTC — pass `2026-06-14T23:59:59Z` to include the full day |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 10) |
| `orderBy` | string | No | Sort order: `ASC` or `DESC` (default: `DESC`) |

**Response:**
```json
{
  "data": [ { ...eventLog } ],
  "total": 42
}
```

---

#### `GET /api/events-log/:id`
Get a single event log entry by ID.

**Path params:**
| Param | Type | Description |
|---|---|---|
| `id` | number | Event log ID |

**Response:**
```json
{
  "success": true,
  "message": "Event log retrieved successfully",
  "data": { "eventLog": { ...eventLog } }
}
```

---

#### `POST /api/events-log`
Create a new event log entry manually.

**Auth:** API key via header `x-api-key: <EVENTS_LOG_API_KEY>`

**Body (JSON):**
| Field | Type | Required | Description |
|---|---|---|---|
| `entity` | string | Yes | Values: `INCOMING_ORDER`, `APP`, `SUPPLIER` |
| `eventName` | string | Yes | Values: `LOGGED_IN`, `ACCOUNTING_FILE_CREATED`, `SUPPLIER_UPDATED` |
| `outcome` | string | No | Values: `FAILED`, `SUCCESS` |
| `userId` | number | No | ID of the user associated with the event |
| `userEmail` | string | No | Email of the user associated with the event |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Event log created successfully",
  "data": { "eventLog": { ...eventLog } }
}
```

---

## Database Models

### User
- id (INTEGER, Auto-increment Primary Key)
- name (String, max 50 chars)
- email (String, Unique)
- password (String, Hashed)
- role (Enum: 'user', 'admin')
- active (Boolean)

### EventLog (`events_log` table)
- id (BIGINT, Auto-increment Primary Key)
- entity (Enum: 'INCOMING_ORDER', 'APP', 'SUPPLIER')
- event_name (Enum: 'LOGGED_IN', 'ACCOUNTING_FILE_CREATED', 'SUPPLIER_UPDATED')
- user_id (INTEGER, Nullable, FK → users)
- user_email (VARCHAR 100, Nullable)
- outcome (VARCHAR: 'FAILED' | 'SUCCESS', Nullable)
- created_at (TIMESTAMPTZ, auto-set on insert)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access Control**: Admin and user roles
- **CORS Protection**: Configurable origins
- **Environment Variables**: Sensitive data in .env

## Development

The project uses ES6 modules with the following conventions:

- All imports from local files must include `.js` extension
- No `.js` extension for npm package imports
- Use `import` and `export` keywords (not `require`)

Example:
```javascript
// Correct
import express from 'express';
import { config } from './config/env.js';

// Incorrect
const express = require('express');
import { config } from './config/env';
```

## Dependencies

Main dependencies:
- **express**: Web framework
- **sequelize**: ORM for database operations
- **pg**: PostgreSQL driver
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **pino**: High-performance structured logging
- **cors**: CORS middleware
- **dotenv**: Environment variable loader

## License

ISC
