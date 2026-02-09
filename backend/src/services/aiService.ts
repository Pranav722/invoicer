import OpenAI from 'openai';
import { createHash } from 'crypto';
import { Tenant } from '../models/Tenant';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { redisClient } from '../config/redis';

interface InvoiceContext {
    tenantName: string;
    vendorName: string;
    currency: string;
    total: number;
    dueDate: string;
    items: string[];
}

interface AIResponse {
    content: string;
    tokensUsed: number;
}

export class AIService {
    private openai: OpenAI;
    private readonly CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || ''
        });
    }

    /**
     * Generate AI content for invoice header or footer
     */
    async generateContent(
        type: 'header' | 'footer',
        prompt: string,
        context: InvoiceContext,
        tenantId: string
    ): Promise<AIResponse> {
        try {
            // 1. Check rate limit
            await this.checkRateLimit(tenantId);

            // 2. Check cache
            const cacheKey = this.generateCacheKey(type, prompt, context);
            const cached = await this.getCachedResponse(cacheKey);

            if (cached) {
                logger.info(`AI cache hit for ${type}`);
                return cached;
            }

            // 3. Build full prompt with context
            const fullPrompt = this.buildPrompt(type, prompt, context);

            // 4. Call OpenAI
            logger.info(`Calling OpenAI for ${type} generation`);
            const completion = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional invoice content writer. Generate concise, professional content.'
                    },
                    {
                        role: 'user',
                        content: fullPrompt
                    }
                ],
                max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
                temperature: 0.7
            });

            const content = completion.choices[0].message.content || '';
            const tokensUsed = completion.usage?.total_tokens || 0;

            // 5. Cache result
            await this.cacheResponse(cacheKey, { content, tokensUsed });

            // 6. Track usage
            await this.trackUsage(tenantId, tokensUsed, type);

            logger.info(`AI ${type} generated successfully. Tokens: ${tokensUsed}`);

            return { content, tokensUsed };
        } catch (error: any) {
            logger.error('AI generation error:', error);

            // Fallback to default content
            if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
                logger.warn('OpenAI rate limit hit, using fallback');
                return this.getFallbackContent(type);
            }

            throw new AppError(
                'AI content generation failed',
                500,
                'AI_GENERATION_ERROR'
            );
        }
    }

    /**
     * Check if tenant has exceeded rate limit
     */
    private async checkRateLimit(tenantId: string): Promise<void> {
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            throw new AppError('Tenant not found', 404, 'NOT_FOUND');
        }

        const limit = this.getRateLimit(tenant.subscription.tier);
        const used = tenant.usage.aiTokensUsedThisMonth || 0;

        if (used >= limit) {
            throw new AppError(
                `AI rate limit exceeded. Limit: ${limit} tokens/month`,
                429,
                'AI_LIMIT_EXCEEDED'
            );
        }
    }

    /**
     * Get rate limit based on subscription tier
     */
    private getRateLimit(tier: string): number {
        const limits: Record<string, number> = {
            free: 5000,       // ~10 invoices with AI
            pro: 50000,       // ~100 invoices
            enterprise: 500000 // ~1000 invoices
        };

        return limits[tier] || limits.free;
    }

    /**
     * Generate cache key from prompt and context
     */
    private generateCacheKey(
        type: string,
        prompt: string,
        context: InvoiceContext
    ): string {
        const data = JSON.stringify({ type, prompt, context });
        return `ai:${createHash('sha256').update(data).digest('hex')}`;
    }

    /**
     * Get cached AI response
     */
    private async getCachedResponse(cacheKey: string): Promise<AIResponse | null> {
        try {
            const cached = await redisClient.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            logger.warn('Redis cache read error:', error);
            return null;
        }
    }

    /**
     * Cache AI response
     */
    private async cacheResponse(
        cacheKey: string,
        response: AIResponse
    ): Promise<void> {
        try {
            await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(response));
        } catch (error) {
            logger.warn('Redis cache write error:', error);
        }
    }

    /**
     * Track AI token usage
     */
    private async trackUsage(
        tenantId: string,
        tokens: number,
        type: string
    ): Promise<void> {
        try {
            await Tenant.findByIdAndUpdate(tenantId, {
                $inc: { 'usage.aiTokensUsedThisMonth': tokens }
            });

            logger.info(`Updated AI usage for tenant ${tenantId}: +${tokens} tokens`);
        } catch (error) {
            logger.error('Error tracking AI usage:', error);
        }
    }

    /**
     * Build full prompt with context
     */
    private buildPrompt(
        type: string,
        userPrompt: string,
        context: InvoiceContext
    ): string {
        const contextInfo = `
Invoice Details:
- Company: ${context.tenantName}
- Client: ${context.vendorName}
- Amount: ${context.currency} ${context.total.toFixed(2)}
- Due Date: ${context.dueDate}
- Services: ${context.items.join(', ')}

Generate a professional ${type} for this invoice.
User's request: "${userPrompt}"

${type === 'header' ? 'Write 2-3 sentences introducing the invoice.' : 'Write 2-3 sentences with payment instructions and thank you message.'}

Keep it professional, concise, and friendly. Do not include addresses or payment details (those are in separate sections).
    `.trim();

        return contextInfo;
    }

    /**
     * Get fallback content when AI fails
     */
    private getFallbackContent(type: 'header' | 'footer'): AIResponse {
        const templates: Record<string, string> = {
            header: 'Thank you for your business. Please find the invoice details below.',
            footer: 'We appreciate your prompt payment. If you have any questions, please contact us.'
        };

        return {
            content: templates[type],
            tokensUsed: 0
        };
    }

    /**
     * Get AI usage stats for tenant
     */
    async getUsageStats(tenantId: string): Promise<any> {
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            throw new AppError('Tenant not found', 404, 'NOT_FOUND');
        }

        const limit = this.getRateLimit(tenant.subscription.tier);
        const used = tenant.usage.aiTokensUsedThisMonth || 0;

        return {
            tier: tenant.subscription.tier,
            tokensUsed: used,
            tokensLimit: limit,
            tokensRemaining: Math.max(0, limit - used),
            percentageUsed: Math.round((used / limit) * 100)
        };
    }
}

// Export singleton instance
export const aiService = new AIService();
