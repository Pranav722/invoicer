import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get AI usage statistics
 */
router.get('/usage', async (req, res, next) => {
    try {
        const tenantId = req.tenantId!;
        const stats = await aiService.getUsageStats(tenantId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Generate AI content (standalone endpoint for testing)
 */
router.post('/generate', async (req, res, next) => {
    try {
        const { type, prompt, context } = req.body;
        const tenantId = req.tenantId!;

        if (!['header', 'footer'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be "header" or "footer"'
            });
        }

        const result = await aiService.generateContent(type, prompt, context, tenantId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

export default router;
