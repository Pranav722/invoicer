import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Upload file (authenticated users only)
// Uses 'file' as the form field name
router.post('/', authenticate, upload.single('file'), UploadController.uploadFile);

export default router;
