import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Default error response
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An internal server error occurred';

    // Handle operational errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = err.message;
    }

    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_ERROR';
        message = 'Resource already exists';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'UNAUTHORIZED';
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token has expired';
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};
