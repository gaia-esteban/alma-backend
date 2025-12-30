# AlMa Backend - Node.js REST API

A modern Node.js backend built with Express, Sequelize ORM, JWT authentication, and TOTP-based two-factor authentication.

## Features

- **ES6 Modules**: Modern JavaScript with import/export syntax
- **Express.js**: Fast, unopinionated web framework
- **Sequelize ORM**: Database management with MySQL
- **JWT Authentication**: Secure token-based authentication
- **TOTP (Time-based One-Time Password)**: Two-factor authentication using otplib
- **Winston Logger**: Professional logging system
- **CORS**: Cross-Origin Resource Sharing support
- **Layered Architecture**: Controllers, Services, Repositories pattern

## Project Structure

```
backend-nodejs-alma/
├── src/
│   ├── config/
│   │   ├── env.js           # Environment configuration loader
│   │   └── database.js      # Sequelize setup and connection
│   ├── utils/
│   │   └── logger.js        # Winston logger configuration
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Invoice.js       # Invoice model
│   │   └── InvoiceDetail.js # InvoiceDetail model with associations
│   ├── repositories/
│   │   ├── userRepository.js    # User data access layer
│   │   └── invoiceRepository.js # Invoice data access layer
│   ├── services/
│   │   ├── authService.js    # Authentication service (JWT, TOTP)
│   │   ├── userService.js    # User business logic
│   │   └── invoiceService.js # Invoice business logic
│   ├── controllers/
│   │   ├── authController.js    # Authentication endpoints
│   │   ├── userController.js    # User CRUD endpoints
│   │   └── invoiceController.js # Invoice endpoints
│   ├── middlewares/
│   │   ├── auth.js          # JWT authentication & authorization
│   │   └── cors.js          # CORS configuration
│   ├── routes/
│   │   └── index.js         # API routes configuration
│   └── index.js             # Application entry point
├── .env                     # Environment variables
├── package.json             # Project dependencies
└── README.md               # This file
```

## Prerequisites

- Node.js 18+ (with ES modules support)
- MySQL 8.0+
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

4. Create the database:
   ```sql
   CREATE DATABASE alma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
- `POST /api/auth/verify-totp` - Verify TOTP code
- `POST /api/auth/enable-2fa` - Enable two-factor authentication
- `POST /api/auth/disable-2fa` - Disable two-factor authentication

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

## Database Models

### User
- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, Hashed)
- role (Enum: 'user', 'admin')
- totpSecret (String, Nullable)
- isTotpEnabled (Boolean)

### Invoice
- id (UUID, Primary Key)
- invoiceNumber (String, Unique)
- customerId (UUID, Foreign Key)
- issueDate (Date)
- dueDate (Date)
- totalAmount (Decimal)
- status (Enum: 'draft', 'pending', 'paid', 'cancelled')

### InvoiceDetail
- id (UUID, Primary Key)
- invoiceId (UUID, Foreign Key)
- description (String)
- quantity (Integer)
- unitPrice (Decimal)
- amount (Decimal)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **TOTP 2FA**: Time-based one-time passwords using otplib
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
- **mysql2**: MySQL driver
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **otplib**: TOTP implementation
- **winston**: Logging library
- **cors**: CORS middleware
- **dotenv**: Environment variable loader

## License

ISC
