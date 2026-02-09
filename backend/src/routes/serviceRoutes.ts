import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get service categories
router.get('/categories', ServiceController.getCategories);

// Create service (Admin only)
router.post('/', authorize('owner', 'admin'), ServiceController.create);

// Get all services
router.get('/', ServiceController.getAll);

// Get single service
router.get('/:id', ServiceController.getById);

// Update service (Admin only)
router.patch('/:id', authorize('owner', 'admin'), ServiceController.update);

// Delete service (Admin only)
router.delete('/:id', authorize('owner', 'admin'), ServiceController.delete);

export default router;
