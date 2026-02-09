import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60');

export const rateLimiter = rateLimit({
    windowMs,
    max: maxRequests,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator based on tenant + IP
    keyGenerator: (req: Request) => {
        const tenantId = req.tenantId || 'anonymous';
        const ip = req.ip || 'unknown';
        return `${tenantId}:${ip}`;
    }
});

// Stricter rate limit for authentication routes
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_AUTH_ATTEMPTS',
            message: 'Too many authentication attempts, please try again later.'
        }
    },
    skipSuccessfulRequests: true
});

// AI endpoint rate limiter (tier-based)
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: async (req: Request) => {
        // TODO: Fetch tenant subscription tier and return appropriate limit
        // Free: 10, Pro: 100, Enterprise: unlimited
        return 10;
    },
    message: {
        success: false,
        error: {
            code: 'AI_RATE_LIMIT_EXCEEDED',
            message: 'AI request limit exceeded. Upgrade to Pro for higher limits.'
        }
    }
});
