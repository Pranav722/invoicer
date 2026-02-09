import express from 'express';
import { AdminEmployeeController } from '../controllers/adminEmployeeController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

/**
 * Admin Employee Management Routes
 * All routes require admin authentication
 */

// Create new employee (Admin only)
router.post(
    '/employees',
    authenticate,
    requireRole(['admin', 'owner']),
    AdminEmployeeController.createEmployee
);

// Assign vendor to employee
router.post(
    '/employees/:employeeId/vendors',
    authenticate,
    requireRole(['admin', 'owner']),
    AdminEmployeeController.assignVendorToEmployee
);

// Remove vendor from employee
router.delete(
    '/employees/:employeeId/vendors/:vendorId',
    authenticate,
    requireRole(['admin', 'owner']),
    AdminEmployeeController.removeVendorFromEmployee
);

// Get employee's assigned vendors
router.get(
    '/employees/:employeeId/vendors',
    authenticate,
    requireRole(['admin', 'owner']),
    AdminEmployeeController.getEmployeeVendors
);

export default router;
