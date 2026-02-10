import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ================================
// MIDDLEWARE
// ================================
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
})); // Security headers with relaxed CSP for cross-origin images
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL,
            'https://invoicerrrr.netlify.app'
        ].filter(Boolean); // Remove undefined/null

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Invoice Generator API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ================================
// API ROUTES (v1)
// ================================// Routes
import authRoutes from './routes/authRoutes';
import vendorRoutes from './routes/vendorRoutes';
import serviceRoutes from './routes/serviceRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import aiRoutes from './routes/aiRoutes';
import userRoutes from './routes/userRoutes';
import tenantRoutes from './routes/tenantRoutes';
import paymentRoutes from './routes/paymentRoutes';
import templateRoutes from './routes/templateRoutes';
import adminRoutes from './routes/adminRoutes';
import employeeVendorRoutes from './routes/employeeVendorRoutes';

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1', paymentRoutes); // Payments use invoices/:id/payments and payments/:id
app.use('/api/v1/admin', adminRoutes); // NEW: Admin employee management
app.use('/api/v1/employee/vendors', employeeVendorRoutes); // NEW: Employee vendor access

import uploadRoutes from './routes/uploadRoutes';
app.use('/api/v1/upload', uploadRoutes);

// Serve static files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// ================================
// ERROR HANDLING
// ================================
app.use(errorHandler);

// ================================
// 404 HANDLER
// ================================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`
        }
    });
});

// ================================
// START SERVER
// ================================
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();
        logger.info('✓ MongoDB connected');

        // Connect to Redis (optional - for caching)
        if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL) {
            try {
                await connectRedis();
                logger.info('✓ Redis connected');
            } catch (error) {
                logger.warn('⚠ Redis connection failed, using in-memory caching');
            }
        } else {
            logger.info('ℹ Redis not configured, using in-memory caching');
        }

        // Start listening
        app.listen(PORT, () => {
            logger.info(`✓ Server running on port ${PORT}`);
            logger.info(`✓ Environment: ${process.env.NODE_ENV}`);
            logger.info(`✓ Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
