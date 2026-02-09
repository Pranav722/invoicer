import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

/**
 * FREE AI Service using Google Gemini API
 * 100% FREE with generous limits:
 * - 15 requests/minute
 * - 1 million tokens/day
 * - No credit card required!
 */

// Types
export interface HeaderFooterContext {
    type: 'header' | 'footer';
    companyName: string;
    industry?: string;
    clientName: string;
    invoiceType: 'standard' | 'reminder' | 'final-notice' | 'thank-you';
    relationship: 'new' | 'existing' | 'long-term';
    tone: 'formal' | 'friendly' | 'professional' | 'casual';
    maxLength?: number;
    includeCallToAction?: boolean;
    language?: string;
}

export interface DesignRecommendation {
    recommendedTemplate: string;
    reasoning: string;
    colorPalette: string[];
    typography: string;
    layoutTips: string[];
    confidence: number;
    alternatives?: Array<{
        template: string;
        reason: string;
    }>;
}

export interface FormattingSuggestion {
    itemDescriptions?: Array<{
        original: string;
        improved: string;
        reason: string;
    }>;
    groupingSuggestion?: {
        shouldGroup: boolean;
        suggestedGroups?: string[];
        reasoning: string;
    };
    notesImprovement?: {
        suggested: string;
        changes: string[];
    };
    termsImprovement?: {
        suggested: string;
        missingClauses: string[];
    };
    overallScore: number;
    priority: string[];
}

export class GeminiAIService {
    private genAI: GoogleGenerativeAI;
    private cache: Map<string, { data: any; timestamp: number }>;
    private rateLimiter: { requests: number[]; limit: number; window: number };
    private usageStats: { total: number; calls: number };

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required. Get yours free at ai.google.dev');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.cache = new Map();

        // Rate limiting: 15 requests per minute (free tier)
        this.rateLimiter = {
            requests: [],
            limit: 15,
            window: 60000, // 1 minute
        };

        this.usageStats = { total: 0, calls: 0 };
    }

    /**
     * Generate header or footer text
     * Cost: $0 (FREE!)
     */
    async generateText(
        context: HeaderFooterContext
    ): Promise<{ text: string; cached: boolean; cost: number }> {
        // Check cache first
        const cacheKey = this.getCacheKey('text', context);
        const cached = this.getFromCache(cacheKey, 86400000); // 24 hours
        if (cached) {
            return { text: cached, cached: true, cost: 0 };
        }

        // Wait for rate limit if needed
        await this.waitForRateLimit();

        // Build prompt
        const prompt = this.buildTextPrompt(context);

        try {
            // Use Gemini 1.5 Flash (fastest, free)
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            // Cache result
            this.setCache(cacheKey, text);

            // Track usage (all free!)
            this.usageStats.calls += 1;

            return { text, cached: false, cost: 0 };
        } catch (error: any) {
            console.error('Gemini text generation error:', error);

            // Check if rate limit error
            if (error.message?.includes('RESOURCE_EXHAUSTED')) {
                console.warn('Rate limit hit, waiting 60s...');
                await this.sleep(60000);
                return this.generateText(context); // Retry
            }

            // Fallback to template
            return {
                text: this.getFallbackText(context),
                cached: false,
                cost: 0,
            };
        }
    }

    /**
     * Get design recommendations
     * Cost: $0 (FREE!)
     */
    async getDesignRecommendations(invoice: {
        industry: string;
        companyName: string;
        totalAmount: number;
        itemCount: number;
        hasLogo: boolean;
        preferredStyle?: string;
    }): Promise<{ recommendation: DesignRecommendation; cached: boolean; cost: number }> {
        // Try rule-based first (instant, free)
        const ruleBasedResult = this.getRuleBasedDesignRecommendation(invoice);
        if (ruleBasedResult.confidence > 85) {
            return {
                recommendation: ruleBasedResult,
                cached: false,
                cost: 0,
            };
        }

        // Check cache
        const cacheKey = this.getCacheKey('design', invoice);
        const cached = this.getFromCache(cacheKey, 86400000);
        if (cached) {
            return { recommendation: cached, cached: true, cost: 0 };
        }

        // Wait for rate limit
        await this.waitForRateLimit();

        const prompt = this.buildDesignPrompt(invoice);

        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.5,
                    responseMimeType: 'application/json',
                } as any
            });

            const result = await model.generateContent(prompt);
            const recommendation = JSON.parse(result.response.text()) as DesignRecommendation;

            this.setCache(cacheKey, recommendation);
            this.usageStats.calls += 1;

            return { recommendation, cached: false, cost: 0 };
        } catch (error: any) {
            console.error('Gemini design recommendation error:', error);

            if (error.message?.includes('RESOURCE_EXHAUSTED')) {
                await this.sleep(60000);
                return this.getDesignRecommendations(invoice);
            }

            return {
                recommendation: ruleBasedResult,
                cached: false,
                cost: 0,
            };
        }
    }

    /**
     * Get formatting suggestions
     * Cost: $0 (FREE!)
     */
    async getFormattingSuggestions(invoice: {
        lineItems: Array<{
            description: string;
            quantity: number;
            rate: number;
            amount: number;
        }>;
        notes?: string;
        terms?: string;
        industry: string;
    }): Promise<{ suggestions: FormattingSuggestion; cached: boolean; cost: number }> {
        // Skip for small invoices
        if (invoice.lineItems.length < 3) {
            return {
                suggestions: {
                    overallScore: 100,
                    priority: [],
                },
                cached: false,
                cost: 0,
            };
        }

        const cacheKey = this.getCacheKey('formatting', invoice);
        const cached = this.getFromCache(cacheKey, 3600000); // 1 hour
        if (cached) {
            return { suggestions: cached, cached: true, cost: 0 };
        }

        await this.waitForRateLimit();

        const prompt = this.buildFormattingPrompt(invoice);

        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.3,
                    // responseMimeType: 'application/json', // Validation error
                }
            });

            const result = await model.generateContent(prompt);
            const suggestions = JSON.parse(result.response.text()) as FormattingSuggestion;

            this.setCache(cacheKey, suggestions);
            this.usageStats.calls += 1;

            return { suggestions, cached: false, cost: 0 };
        } catch (error: any) {
            console.error('Gemini formatting suggestions error:', error);

            if (error.message?.includes('RESOURCE_EXHAUSTED')) {
                await this.sleep(60000);
                return this.getFormattingSuggestions(invoice);
            }

            return {
                suggestions: {
                    overallScore: 85,
                    priority: [],
                },
                cached: false,
                cost: 0,
            };
        }
    }

    /**
     * Get usage statistics
     */
    getStats() {
        return {
            totalCalls: this.usageStats.calls,
            totalCost: 0, // Always FREE!
            cacheSize: this.cache.size,
            rateLimitRemaining: this.getRateLimitRemaining(),
            service: 'Google Gemini API (FREE)',
            limits: {
                requestsPerMinute: 15,
                tokensPerDay: 1000000,
                cost: '$0/month',
            },
        };
    }

    // =========== Private Helper Methods ===========

    /**
     * Rate limiter to stay within free tier limits
     */
    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();

        // Remove requests older than 1 minute
        this.rateLimiter.requests = this.rateLimiter.requests.filter(
            (timestamp) => now - timestamp < this.rateLimiter.window
        );

        // If at limit, wait
        if (this.rateLimiter.requests.length >= this.rateLimiter.limit) {
            const oldestRequest = this.rateLimiter.requests[0];
            const waitTime = this.rateLimiter.window - (now - oldestRequest);

            if (waitTime > 0) {
                console.log(`Rate limit: waiting ${waitTime}ms...`);
                await this.sleep(waitTime);
            }
        }

        // Add current request
        this.rateLimiter.requests.push(Date.now());
    }

    private getRateLimitRemaining(): number {
        const now = Date.now();
        const recentRequests = this.rateLimiter.requests.filter(
            (timestamp) => now - timestamp < this.rateLimiter.window
        );
        return Math.max(0, this.rateLimiter.limit - recentRequests.length);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private buildTextPrompt(context: HeaderFooterContext): string {
        const { type, companyName, industry, clientName, invoiceType, relationship, tone, maxLength } = context;

        return `You are a professional business writer. Generate a ${type} message for an invoice.

Context:
- Company: ${companyName}${industry ? ` (${industry})` : ''}
- Client: ${clientName}
- Invoice Type: ${invoiceType}
- Relationship: ${relationship}
- Tone: ${tone}
- Max Length: ${maxLength || 200} characters

Requirements:
- Write in ${tone} tone
- Professional and appropriate
${context.includeCallToAction ? '- Include payment call-to-action' : ''}
- Language: ${context.language || 'English'}

Return only the message text, no explanations.`;
    }

    private buildDesignPrompt(invoice: any): string {
        return `Analyze this invoice and recommend the best template design.

Invoice Details:
- Industry: ${invoice.industry}
- Company: ${invoice.companyName}
- Total: $${invoice.totalAmount}
- Items: ${invoice.itemCount}
- Has Logo: ${invoice.hasLogo ? 'Yes' : 'No'}
- Style Preference: ${invoice.preferredStyle || 'professional'}

Templates: classic-professional, modern-minimal, bold-statement, sidebar-layout, compact-executive, creative-agency, split-screen, top-heavy, grid-mastery, minimalist-luxury, data-dense, floating-boxes, timeline-style, professional-certificate

Return ONLY valid JSON (no markdown):
{
  "recommendedTemplate": "template-id",
  "reasoning": "why this template",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "typography": "font suggestion",
  "layoutTips": ["tip1", "tip2", "tip3"],
  "confidence": 85
}`;
    }

    private buildFormattingPrompt(invoice: any): string {
        const itemsSummary = invoice.lineItems
            .slice(0, 10)
            .map((item: any) => `- ${item.description} (${item.quantity} × $${item.rate})`)
            .join('\n');

        return `Analyze this invoice and suggest formatting improvements.

Industry: ${invoice.industry}
Items (${invoice.lineItems.length}):
${itemsSummary}

Notes: ${invoice.notes || 'None'}
Terms: ${invoice.terms || 'None'}

Return ONLY valid JSON (no markdown):
{
  "itemDescriptions": [{"original": "...", "improved": "...", "reason": "..."}],
  "groupingSuggestion": {"shouldGroup": true, "suggestedGroups": ["cat1"], "reasoning": "..."},
  "notesImprovement": {"suggested": "...", "changes": ["change1"]},
  "termsImprovement": {"suggested": "...", "missingClauses": ["clause1"]},
  "overallScore": 85,
  "priority": ["top suggestion 1", "top suggestion 2"]
}

Focus on top 3-5 improvements only.`;
    }

    private getRuleBasedDesignRecommendation(invoice: any): DesignRecommendation {
        let template = 'classic-professional';
        let confidence = 75;

        if (invoice.totalAmount > 50000) {
            template = 'minimalist-luxury';
            confidence = 90;
        } else if (invoice.industry.toLowerCase().includes('creative')) {
            template = 'creative-agency';
            confidence = 85;
        } else if (invoice.itemCount > 20) {
            template = 'data-dense';
            confidence = 88;
        } else if (invoice.preferredStyle === 'minimal') {
            template = 'modern-minimal';
            confidence = 92;
        }

        return {
            recommendedTemplate: template,
            reasoning: `Selected based on ${invoice.totalAmount > 50000 ? 'high value' : invoice.industry}`,
            colorPalette: ['#1a1a2e', '#16213e', '#0f3460'],
            typography: 'Inter for headings, System fonts for body',
            layoutTips: [
                'Use consistent spacing',
                'High contrast for readability',
                'Important info above fold',
            ],
            confidence,
        };
    }

    private getFallbackText(context: HeaderFooterContext): string {
        const templates = {
            header: {
                formal: `Thank you for your business. Please find below the invoice details.`,
                friendly: `Thanks for working with us! Here's your invoice.`,
                professional: `Invoice for professional services rendered.`,
                casual: `Hey! Here's your invoice. Questions? Just ask!`,
            },
            footer: {
                formal: `Payment is due within 30 days. For inquiries, contact our accounting department.`,
                friendly: `Payment due in 30 days. Reach out anytime!`,
                professional: `Net 30 payment terms apply. Thank you.`,
                casual: `Pay within 30 days. Thanks!`,
            },
        };

        return templates[context.type][context.tone] || templates[context.type].professional;
    }

    private getCacheKey(type: string, data: any): string {
        const hash = createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');
        return `${type}:${hash}`;
    }

    private getFromCache(key: string, ttlMs: number): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > ttlMs) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });

        // Limit cache size to 1000 items
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
    }
}

// Export singleton instance
export const geminiAIService = new GeminiAIService(
    process.env.GEMINI_API_KEY || ''
);
