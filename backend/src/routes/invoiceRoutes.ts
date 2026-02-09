import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/stats', InvoiceController.getDashboardStats);

// Create invoice
router.post('/', authorize('owner', 'admin', 'employee'), InvoiceController.create);

// Get all invoices
router.get('/', InvoiceController.getAll);

// Get single invoice
router.get('/:id', InvoiceController.getById);

// Update invoice
router.patch('/:id', authorize('owner', 'admin', 'employee'), InvoiceController.update);

// Delete invoice
router.delete('/:id', authorize('owner', 'admin'), InvoiceController.delete);

// Generate PDF
router.post('/:id/pdf', InvoiceController.generatePDF);

// Download PDF
router.get('/:id/pdf/download', InvoiceController.downloadPDF);

// Update status
router.patch('/:id/status', authorize('owner', 'admin', 'employee'), InvoiceController.updateStatus);

// Duplicate invoice
// Duplicate invoice
router.post('/:id/duplicate', authorize('owner', 'admin', 'employee'), InvoiceController.duplicate);

// Send invoice via email
// Send invoice via email
import { getTemplates } from '../controllers/invoiceEmailController';
router.post('/:id/send', authorize('owner', 'admin', 'employee'), InvoiceController.sendEmail);

// Get available templates
router.get('/templates', getTemplates);

export default router;
