import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { User } from '../models/User';
import { AppError } from './errorHandler';

// Extend Express Request type to include user data
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                tenantId: string;
                email: string;
                role: string;
            };
            tenantId?: string;
        }
    }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401, 'UNAUTHORIZED');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = AuthService.verifyAccessToken(token);

        // Verify user still exists and is active
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new AppError('User not found or inactive', 401, 'UNAUTHORIZED');
        }

        // Attach user data to request
        req.user = {
            userId: payload.userId,
            tenantId: payload.tenantId,
            email: payload.email,
            role: payload.role
        };
        req.tenantId = payload.tenantId;

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
        }
        next(error);
    }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    'Insufficient permissions',
                    403,
                    'FORBIDDEN'
                )
            );
        }

        next();
    };
};

/**
 * Middleware to ensure all queries are scoped to user's tenant
 */
export const tenantMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.tenantId) {
        return next(new AppError('Tenant context missing', 400, 'BAD_REQUEST'));
    }
    next();
};
