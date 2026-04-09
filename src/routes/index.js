import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import invoiceController from '../controllers/invoiceController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Health Check Route
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Authentication Routes
 * @prefix /api/auth
 */
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));

/**
 * User Routes
 * @prefix /api/users
 */
// CRUD operations
router.get('/users', authenticate, requireAdmin, userController.getAllUsers.bind(userController));
router.get('/users/:id', authenticate, userController.getUserById.bind(userController));
router.post('/users', authenticate, requireAdmin, userController.createUser.bind(userController));
router.put('/users/:id', authenticate, userController.updateUser.bind(userController));
router.delete('/users/:id', authenticate, requireAdmin, userController.deleteUser.bind(userController));

/**
 * Incoming Orders Routes
 * @prefix /api/incoming-orders
 */
// GET operations
router.get('/incoming-orders', authenticate, invoiceController.getAllInvoices.bind(invoiceController));
router.get('/incoming-orders/:id', authenticate, invoiceController.getInvoiceById.bind(invoiceController));
// POST operations
router.post('/incoming-orders/export', authenticate, invoiceController.exportInvoices.bind(invoiceController));

/**
 * 404 Handler for API routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

export default router;
