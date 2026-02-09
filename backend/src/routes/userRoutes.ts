import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Owner/Admin)
router.get('/', authorize('owner', 'admin'), UserController.getAll);

// Get single user
router.get('/:id', UserController.getById);

// Create user (Owner/Admin)
router.post('/', authorize('owner', 'admin'), UserController.create);

// Update user (Owner/Admin)
router.patch('/:id', authorize('owner', 'admin'), UserController.update);

// Deactivate user (Owner/Admin)
router.delete('/:id', authorize('owner', 'admin'), UserController.deactivate);

// Change role (Owner/Admin)
router.patch('/:id/role', authorize('owner', 'admin'), UserController.changeRole);

// Change password (Self or Owner/Admin)
router.patch('/:id/password', UserController.changePassword);

export default router;
