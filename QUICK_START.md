# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alma_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE alma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using command line:

```bash
mysql -u root -p -e "CREATE DATABASE alma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Start the Server

**Production mode:**
```bash
npm start
```

**Development mode (with auto-reload):**
```bash
npm run dev
```

The server will:
- Test database connection
- Automatically create all tables (Users, Invoices, InvoiceDetails)
- Start listening on `http://localhost:3000`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Get User Profile (Protected Route)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create an Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "invoice": {
      "invoiceNumber": "INV-001",
      "customerId": "USER_ID_HERE",
      "issueDate": "2025-01-01",
      "dueDate": "2025-01-31",
      "status": "pending"
    },
    "details": [
      {
        "description": "Web Development Service",
        "quantity": 10,
        "unitPrice": 100.00
      }
    ]
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-totp` - Verify 2FA code
- `GET /api/auth/me` - Get profile (protected)
- `POST /api/auth/enable-2fa` - Enable 2FA (protected)
- `POST /api/auth/confirm-2fa` - Confirm 2FA setup (protected)
- `POST /api/auth/disable-2fa` - Disable 2FA (protected)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/change-password` - Change password

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (admin only)
- `PATCH /api/invoices/:id/status` - Update invoice status
- `GET /api/invoices/statistics` - Get invoice statistics

## Project Structure

```
backend-nodejs-alma/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.js        # Environment variables
│   │   └── database.js   # Sequelize database setup
│   ├── utils/            # Utility functions
│   │   └── logger.js     # Winston logger
│   ├── models/           # Sequelize models
│   │   ├── User.js
│   │   ├── Invoice.js
│   │   └── InvoiceDetail.js
│   ├── repositories/     # Data access layer
│   │   ├── userRepository.js
│   │   └── invoiceRepository.js
│   ├── services/         # Business logic layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── invoiceService.js
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── invoiceController.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.js       # JWT authentication
│   │   └── cors.js       # CORS configuration
│   ├── routes/           # API routes
│   │   └── index.js
│   └── index.js          # Application entry point
├── logs/                 # Log files (auto-created)
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── README.md            # Full documentation
```

## Troubleshooting

### Database Connection Failed

- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use

Change the port in `.env`:
```env
PORT=3001
```

### Module Not Found Errors

Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TOTP/2FA Issues

- Ensure `otplib` is installed: `npm install otplib`
- Use Google Authenticator or similar app to scan QR codes
- TOTP codes expire every 30 seconds

## Security Notes

1. **Change JWT Secret**: Always use a strong, unique JWT secret in production
2. **Environment Variables**: Never commit `.env` file to version control
3. **Database Password**: Use strong passwords for database access
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure appropriate CORS origins for your frontend

## Next Steps

1. Set up a frontend application to consume this API
2. Configure proper CORS origins
3. Set up database backups
4. Implement rate limiting
5. Add API documentation (Swagger/OpenAPI)
6. Set up monitoring and logging
7. Configure CI/CD pipeline
8. Add comprehensive tests

## Support

For issues or questions, refer to:
- README.md for detailed documentation
- Check logs in `logs/` directory
- Review error messages in console output
