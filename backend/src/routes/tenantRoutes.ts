import { Router } from 'express';
import { TenantController } from '../controllers/tenantController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current tenant
router.get('/me', TenantController.getCurrent);

// Update branding (Pro+, Owner/Admin)
router.patch('/me/branding', authorize('owner', 'admin'), TenantController.updateBranding);

// Update profile (Company Info & Payment Details)
router.patch('/me/profile', authorize('owner', 'admin'), TenantController.updateProfile);

// Update settings (Owner/Admin)
router.patch('/me/settings', authorize('owner', 'admin'), TenantController.updateSettings);

// Get subscription info
router.get('/me/subscription', TenantController.getSubscription);

export default router;
