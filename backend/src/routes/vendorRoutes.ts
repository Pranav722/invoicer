import { Router } from 'express';
import { VendorController } from '../controllers/vendorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create vendor (Admin/Employee)
router.post('/', authorize('owner', 'admin', 'employee'), VendorController.create);

// Get all vendors
router.get('/', VendorController.getAll);

// Get single vendor
router.get('/:id', VendorController.getById);

// Update vendor (Admin/Employee)
router.patch('/:id', authorize('owner', 'admin', 'employee'), VendorController.update);

// Delete vendor (Admin only)
router.delete('/:id', authorize('owner', 'admin'), VendorController.delete);

// Get vendor's invoices
router.get('/:id/invoices', VendorController.getInvoices);

// Vendor Services routes
import { VendorServiceController } from '../controllers/vendorServiceController';

// Get all services for a vendor
router.get('/:vendorId/services', VendorServiceController.getVendorServices);

// Assign service to vendor (Admin only)
router.post('/:vendorId/services', authorize('owner', 'admin'), VendorServiceController.assignService);

// Update vendor service (Admin only)
router.patch('/:vendorId/services/:vendorServiceId', authorize('owner', 'admin'), VendorServiceController.updateVendorService);

// Remove service from vendor (Admin only)
router.delete('/:vendorId/services/:vendorServiceId', authorize('owner', 'admin'), VendorServiceController.removeService);

export default router;

