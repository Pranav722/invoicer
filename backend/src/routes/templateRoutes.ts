import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { authenticate, authorize } from '../middleware/auth';


const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/templates - Get all templates (presets + custom)
router.get('/', templateController.getTemplates.bind(templateController));

// GET /api/templates/presets - Get preset templates only
router.get('/presets', templateController.getPresetTemplates.bind(templateController));

// GET /api/templates/custom - Get user's custom templates
router.get('/custom', templateController.getCustomTemplates.bind(templateController));

// GET /api/templates/:id - Get single template
router.get('/:id', templateController.getTemplateById.bind(templateController));

// POST /api/templates - Create custom template (employee+)
router.post(
    '/',
    authorize('owner', 'admin', 'employee'),
    templateController.createTemplate.bind(templateController)
);

// PUT /api/templates/:id - Update template (employee+)
router.put(
    '/:id',
    authorize('owner', 'admin', 'employee'),
    templateController.updateTemplate.bind(templateController)
);

// DELETE /api/templates/:id - Delete template (employee+)
router.delete(
    '/:id',
    authorize('owner', 'admin', 'employee'),
    templateController.deleteTemplate.bind(templateController)
);

// POST /api/templates/:id/duplicate - Duplicate template (employee+)
router.post(
    '/:id/duplicate',
    authorize('owner', 'admin', 'employee'),
    templateController.duplicateTemplate.bind(templateController)
);

// PUT /api/templates/:id/set-default - Set as default (employee+)
router.put(
    '/:id/set-default',
    authorize('owner', 'admin', 'employee'),
    templateController.setDefaultTemplate.bind(templateController)
);

export default router;
