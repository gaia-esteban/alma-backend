import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import invoiceController from '../controllers/invoiceController.js';
import supplierController from '../controllers/supplierController.js';
import companyController from '../controllers/companyController.js';
import eventLogController from '../controllers/eventLogController.js';
import { authenticate, requireAdmin, requireApiKey } from '../middlewares/auth.js';
import { requireCompanyIdParam, requireSingleCompanyId } from '../middlewares/companyScope.js';

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
router.post('/auth/register', authenticate, requireAdmin, authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));

/**
 * User Routes
 * @prefix /api/users
 */
// CRUD operations
router.get('/users', authenticate, requireAdmin, userController.getAllUsers.bind(userController));
router.get('/users/:id', authenticate, userController.getUserById.bind(userController));
router.post('/users', authenticate, requireAdmin, userController.createUser.bind(userController));
router.put('/users/:id', authenticate, requireAdmin, userController.updateUser.bind(userController));
router.delete('/users/:id', authenticate, requireAdmin, userController.deleteUser.bind(userController));

/**
 * Incoming Orders Routes
 * @prefix /api/incoming-orders
 */
// GET operations
router.get('/incoming-orders', authenticate, requireCompanyIdParam, invoiceController.getAllInvoices.bind(invoiceController));
router.get('/incoming-orders/:id', authenticate, requireCompanyIdParam, invoiceController.getInvoiceById.bind(invoiceController));
// POST operations
router.post('/incoming-orders/export', authenticate, requireSingleCompanyId, invoiceController.exportInvoices.bind(invoiceController));
// PATCH operations
router.patch('/incoming-orders/:id/status', authenticate, requireSingleCompanyId, invoiceController.updateInvoiceStatus.bind(invoiceController));

/**
 * Supplier Routes
 * @prefix /api/suppliers
 */
router.get('/suppliers', authenticate, requireCompanyIdParam, supplierController.getAllSuppliers.bind(supplierController));
router.get('/suppliers/:id', authenticate, requireCompanyIdParam, supplierController.getSupplierById.bind(supplierController));
router.post('/suppliers', authenticate, requireSingleCompanyId, supplierController.createSupplier.bind(supplierController));
router.patch('/suppliers/:id', authenticate, requireSingleCompanyId, supplierController.updateSupplier.bind(supplierController));

/**
 * Company Routes
 * @prefix /api/companies
 */
router.get('/companies', authenticate, companyController.getAllCompanies.bind(companyController));
router.get('/companies/:id', authenticate, companyController.getCompanyById.bind(companyController));
router.post('/companies', authenticate, requireAdmin, companyController.createCompany.bind(companyController));
router.patch('/companies/:id', authenticate, requireAdmin, companyController.updateCompany.bind(companyController));

/**
 * Event Log Routes
 * @prefix /api/events-log
 */
router.get('/events-log', authenticate, requireCompanyIdParam, eventLogController.getAll.bind(eventLogController));
router.get('/events-log/:id', authenticate, requireCompanyIdParam, eventLogController.getById.bind(eventLogController));
router.post('/events-log', requireApiKey, eventLogController.create.bind(eventLogController));

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
