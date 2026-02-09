import express from 'express';
import { geminiAIService } from '../services/ai/GeminiAIService';
import { convertAmountToWords } from '../utils/amountToWords';
import { authenticate as auth } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/ai/generate-text
 * Generate header or footer text using AI
 */
router.post('/generate-text', auth, async (req, res) => {
    try {
        const context = req.body;

        // Validate request
        if (!context.type || !context.companyName || !context.clientName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: type, companyName, clientName',
            });
        }

        const result = await geminiAIService.generateText(context);

        res.json({
            success: true,
            data: {
                text: result.text,
                cached: result.cached,
                cost: result.cost,
            },
        });
    } catch (error: any) {
        console.error('AI text generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate text',
        });
    }
});

/**
 * POST /api/ai/design-recommendations
 * Get design template recommendations using AI
 */
router.post('/design-recommendations', auth, async (req, res) => {
    try {
        const invoice = req.body;

        // Validate request
        if (!invoice.industry || !invoice.companyName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: industry, companyName',
            });
        }

        const result = await geminiAIService.getDesignRecommendations(invoice);

        res.json({
            success: true,
            data: {
                recommendation: result.recommendation,
                cached: result.cached,
                cost: result.cost,
            },
        });
    } catch (error: any) {
        console.error('AI design recommendation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get design recommendations',
        });
    }
});

/**
 * POST /api/ai/formatting-suggestions
 * Get smart formatting suggestions using AI
 */
router.post('/formatting-suggestions', auth, async (req, res) => {
    try {
        const invoice = req.body;

        // Validate request
        if (!invoice.lineItems || !Array.isArray(invoice.lineItems)) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid lineItems array',
            });
        }

        const result = await geminiAIService.getFormattingSuggestions(invoice);

        res.json({
            success: true,
            data: {
                suggestions: result.suggestions,
                cached: result.cached,
                cost: result.cost,
            },
        });
    } catch (error: any) {
        console.error('AI formatting suggestions error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get formatting suggestions',
        });
    }
});

/**
 * POST /api/ai/amount-to-words
 * Convert numerical amount to words (deterministic, no AI)
 */
router.post('/amount-to-words', auth, async (req, res) => {
    try {
        const { amount, currency = 'USD', format = 'formal', includeDecimals = true } = req.body;

        // Validate request
        if (typeof amount !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount - must be a number',
            });
        }

        const text = convertAmountToWords({
            amount,
            currency,
            format,
            includeDecimals,
        });

        res.json({
            success: true,
            data: {
                text,
                cost: 0, // Free!
            },
        });
    } catch (error: any) {
        console.error('Amount to words error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to convert amount to words',
        });
    }
});

/**
 * GET /api/ai/cost-stats
 * Get AI usage and cost statistics
 */
router.get('/cost-stats', auth, async (req, res) => {
    try {
        const stats = geminiAIService.getStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        console.error('Cost stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get cost statistics',
        });
    }
});

export default router;
