import express from 'express';
import { EmployeeVendorController } from '../controllers/employeeVendorController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

/**
 * Employee Vendor Routes
 * For employees to access their assigned vendors
 */

// Get assigned vendors (Employee only)
router.get(
    '/my-vendors',
    authenticate,
    requireRole(['employee']),
    EmployeeVendorController.getAssignedVendors
);

// Check if vendors exist (used to enable/disable invoice creation)
router.get(
    '/check',
    authenticate,
    EmployeeVendorController.checkVendorExists
);

// Get vendor header/footer for invoice
router.get(
    '/:vendorId/header-footer',
    authenticate,
    EmployeeVendorController.getVendorHeaderFooter
);

export default router;
