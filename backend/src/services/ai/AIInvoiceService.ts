import OpenAI from 'openai';
import { createHash } from 'crypto';

/**
 * AI Service for Invoice Enhancement
 * Provides intelligent text generation, design recommendations, and formatting suggestions
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

export class AIInvoiceService {
    private openai: OpenAI;
    private cache: Map<string, { data: any; timestamp: number }>;
    private costTracker: { total: number; calls: number };

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
        this.cache = new Map();
        this.costTracker = { total: 0, calls: 0 };
    }

    /**
     * Generate header or footer text
     */
    async generateText(
        context: HeaderFooterContext
    ): Promise<{ text: string; cached: boolean; cost: number }> {
        // Generate cache key
        const cacheKey = this.getCacheKey('text', context);

        // Check cache (24h TTL)
        const cached = this.getFromCache(cacheKey, 86400000); // 24 hours
        if (cached) {
            return { text: cached, cached: true, cost: 0 };
        }

        // Build prompt
        const prompt = this.buildTextPrompt(context);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional business writer specializing in invoice communications. Generate concise, appropriate text based on the context provided. Return only the text, no explanations.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 200,
            });

            const text = response.choices[0].message.content?.trim() || '';
            const cost = this.calculateCost(response.usage);

            // Cache result
            this.setCache(cacheKey, text);

            // Track cost
            this.costTracker.total += cost;
            this.costTracker.calls += 1;

            return { text, cached: false, cost };
        } catch (error) {
            console.error('AI text generation error:', error);
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
     */
    async getDesignRecommendations(invoice: {
        industry: string;
        companyName: string;
        totalAmount: number;
        itemCount: number;
        hasLogo: boolean;
        preferredStyle?: string;
    }): Promise<{ recommendation: DesignRecommendation; cached: boolean; cost: number }> {
        // Try rule-based first (free!)
        const ruleBasedResult = this.getRuleBasedDesignRecommendation(invoice);
        if (ruleBasedResult.confidence > 85) {
            return {
                recommendation: ruleBasedResult,
                cached: false,
                cost: 0,
            };
        }

        // Use AI for complex cases
        const cacheKey = this.getCacheKey('design', invoice);
        const cached = this.getFromCache(cacheKey, 86400000);
        if (cached) {
            return { recommendation: cached, cached: true, cost: 0 };
        }

        const prompt = this.buildDesignPrompt(invoice);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an expert invoice designer. Analyze the invoice context and provide design recommendations in JSON format only. Be specific and actionable.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.5,
                max_tokens: 500,
            });

            const recommendation = JSON.parse(
                response.choices[0].message.content || '{}'
            ) as DesignRecommendation;
            const cost = this.calculateCost(response.usage);

            this.setCache(cacheKey, recommendation);
            this.costTracker.total += cost;
            this.costTracker.calls += 1;

            return { recommendation, cached: false, cost };
        } catch (error) {
            console.error('AI design recommendation error:', error);
            return {
                recommendation: ruleBasedResult,
                cached: false,
                cost: 0,
            };
        }
    }

    /**
     * Get formatting suggestions
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
        const cached = this.getFromCache(cacheKey, 3600000); // 1 hour cache
        if (cached) {
            return { suggestions: cached, cached: true, cost: 0 };
        }

        const prompt = this.buildFormattingPrompt(invoice);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an invoice formatting expert. Analyze the invoice and provide actionable formatting suggestions in JSON format. Focus on clarity, professionalism, and completeness.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 600,
            });

            const suggestions = JSON.parse(
                response.choices[0].message.content || '{}'
            ) as FormattingSuggestion;
            const cost = this.calculateCost(response.usage);

            this.setCache(cacheKey, suggestions);
            this.costTracker.total += cost;
            this.costTracker.calls += 1;

            return { suggestions, cached: false, cost };
        } catch (error) {
            console.error('AI formatting suggestions error:', error);
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
     * Get cost statistics
     */
    getCostStats() {
        return {
            totalCost: this.costTracker.total,
            totalCalls: this.costTracker.calls,
            averageCost: this.costTracker.calls > 0
                ? this.costTracker.total / this.costTracker.calls
                : 0,
            cacheSize: this.cache.size,
        };
    }

    // =========== Private Helper Methods ===========

    private buildTextPrompt(context: HeaderFooterContext): string {
        const { type, companyName, industry, clientName, invoiceType, relationship, tone, maxLength } = context;

        return `Generate a ${type} message for an invoice with the following context:
- Company: ${companyName}${industry ? ` (${industry})` : ''}
- Client: ${clientName}
- Invoice Type: ${invoiceType}
- Relationship: ${relationship}
- Tone: ${tone}

Requirements:
- Length: ${maxLength || 200} characters maximum
- Style: ${tone}, professional
${context.includeCallToAction ? '- Include a clear call-to-action for payment' : ''}
- Language: ${context.language || 'English'}

Generate only the message text, no explanations or quotes.`;
    }

    private buildDesignPrompt(invoice: any): string {
        return `Analyze this invoice and recommend the best design approach:

Invoice Details:
- Industry: ${invoice.industry}
- Company: ${invoice.companyName}
- Total Amount: $${invoice.totalAmount}
- Number of Items: ${invoice.itemCount}
- Has Logo: ${invoice.hasLogo ? 'Yes' : 'No'}
- Preferred Style: ${invoice.preferredStyle || 'professional'}

Available Templates: classic-professional, modern-minimal, bold-statement, sidebar-layout, compact-executive, creative-agency, split-screen, top-heavy, grid-mastery, minimalist-luxury, data-dense, floating-boxes, timeline-style, professional-certificate

Provide recommendations in this exact JSON structure:
{
  "recommendedTemplate": "template-id",
  "reasoning": "brief explanation",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "typography": "font pairing suggestion",
  "layoutTips": ["tip1", "tip2", "tip3"],
  "confidence": 0-100
}`;
    }

    private buildFormattingPrompt(invoice: any): string {
        const itemsSummary = invoice.lineItems
            .slice(0, 10)
            .map((item: any) => `- ${item.description} (Qty: ${item.quantity}, $${item.amount})`)
            .join('\n');

        return `Analyze this invoice and provide smart formatting suggestions:

Invoice Data:
- Industry: ${invoice.industry}
- Line Items: ${invoice.lineItems.length} items
- Current Notes: ${invoice.notes || 'None'}
- Current Terms: ${invoice.terms || 'None'}

Sample Line Items:
${itemsSummary}

Provide suggestions in this JSON structure:
{
  "itemDescriptions": [{"original": "...", "improved": "...", "reason": "..."}],
  "groupingSuggestion": {"shouldGroup": boolean, "suggestedGroups": [], "reasoning": "..."},
  "notesImprovement": {"suggested": "...", "changes": []},
  "termsImprovement": {"suggested": "...", "missingClauses": []},
  "overallScore": 0-100,
  "priority": ["suggestion1", "suggestion2"]
}

Focus on the top 3-5 most impactful improvements.`;
    }

    private getRuleBasedDesignRecommendation(invoice: any): DesignRecommendation {
        // Simple rule-based logic for common scenarios
        let template = 'classic-professional';
        let confidence = 75;

        if (invoice.totalAmount > 50000) {
            template = 'minimalist-luxury';
            confidence = 90;
        } else if (invoice.industry.toLowerCase().includes('creative') ||
            invoice.industry.toLowerCase().includes('design')) {
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
            reasoning: `Selected based on ${invoice.totalAmount > 50000 ? 'high value' : invoice.industry} characteristics`,
            colorPalette: ['#1a1a2e', '#16213e', '#0f3460'],
            typography: 'Inter for headings, System fonts for body',
            layoutTips: [
                'Use consistent spacing throughout',
                'Ensure high contrast for readability',
                'Keep important information above the fold',
            ],
            confidence,
        };
    }

    private getFallbackText(context: HeaderFooterContext): string {
        const templates = {
            header: {
                formal: `Thank you for your business. Please find below the invoice details for services rendered.`,
                friendly: `Thanks for working with us! Here's your invoice for this period.`,
                professional: `Invoice for professional services. Please review the details below.`,
                casual: `Hey there! Here's your invoice. Let us know if you have any questions!`,
            },
            footer: {
                formal: `Payment is due within 30 days of invoice date. For inquiries, please contact our accounting department.`,
                friendly: `Payment due in 30 days. Questions? Just reach out anytime!`,
                professional: `Net 30 payment terms apply. Thank you for your business.`,
                casual: `Pay whenever works for you (but ideally within 30 days 😊). Thanks!`,
            },
        };

        return templates[context.type][context.tone] || templates[context.type].professional;
    }

    private calculateCost(usage: any): number {
        if (!usage) return 0;
        // GPT-4o-mini pricing
        const inputCost = (usage.prompt_tokens / 1_000_000) * 0.15;
        const outputCost = (usage.completion_tokens / 1_000_000) * 0.60;
        return inputCost + outputCost;
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
export const aiService = new AIInvoiceService(process.env.OPENAI_API_KEY || '');
