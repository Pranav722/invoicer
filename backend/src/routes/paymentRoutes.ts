import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * All payment routes require authentication
 */
router.use(authenticate);

/**
 * POST /api/v1/invoices/:id/payments
 * Record a new payment for an invoice
 * Roles: owner, admin, user
 */
router.post(
    '/invoices/:id/payments',
    authorize('owner', 'admin', 'user'),
    PaymentController.create
);

/**
 * GET /api/v1/invoices/:id/payments
 * Get all payments for a specific invoice
 * Roles: owner, admin, user, viewer
 */
router.get('/invoices/:id/payments', PaymentController.getByInvoice);

/**
 * GET /api/v1/payments
 * Get all payments with filtering
 * Roles: owner, admin, user, viewer
 */
router.get('/payments', PaymentController.getAll);

/**
 * DELETE /api/v1/payments/:id
 * Delete a payment record
 * Roles: owner, admin
 */
router.delete('/payments/:id', authorize('owner', 'admin'), PaymentController.delete);

export default router;
