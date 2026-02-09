import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
    /**
     * Register new tenant with owner account
     */
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                companyName,
                subdomain,
                ownerEmail,
                ownerPassword,
                ownerFirstName,
                ownerLastName
            } = req.body;

            // Check if subdomain already exists
            const existingTenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
            if (existingTenant) {
                throw new AppError('Subdomain already taken', 409, 'DUPLICATE_ERROR');
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email: ownerEmail.toLowerCase() });
            if (existingUser) {
                throw new AppError('Email already registered', 409, 'DUPLICATE_ERROR');
            }

            // Create tenant first (temporary owner reference)
            const tenant = await Tenant.create({
                companyName,
                subdomain: subdomain.toLowerCase(),
                ownerEmail: ownerEmail.toLowerCase(),
                ownerUserId: new (require('mongoose').Types.ObjectId)(), // Temporary
                subscription: {
                    tier: 'free',
                    status: 'trialing',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
                    cancelAtPeriodEnd: false
                }
            });

            // Create owner user
            const owner = await User.create({
                tenantId: tenant._id,
                email: ownerEmail.toLowerCase(),
                passwordHash: ownerPassword, // Will be hashed by pre-save hook
                profile: {
                    firstName: ownerFirstName,
                    lastName: ownerLastName
                },
                role: 'owner',
                isActive: true
            });

            // Update tenant with actual owner ID
            tenant.ownerUserId = owner._id;
            await tenant.save();

            // Generate tokens
            const accessToken = AuthService.generateAccessToken(owner);
            const refreshToken = AuthService.generateRefreshToken(owner);

            // Save refresh token to user
            owner.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                deviceInfo: req.headers['user-agent']
            });
            await owner.save();

            logger.info(`New tenant registered: ${tenant.subdomain}`);

            res.status(201).json({
                success: true,
                data: {
                    tenantId: tenant._id,
                    userId: owner._id,
                    accessToken,
                    refreshToken,
                    subscription: {
                        tier: tenant.subscription.tier,
                        status: tenant.subscription.status,
                        trialEndDate: tenant.subscription.currentPeriodEnd
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, tenantSubdomain } = req.body;

            // Find tenant
            const tenant = await Tenant.findOne({ subdomain: tenantSubdomain.toLowerCase() });
            if (!tenant) {
                throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
            }

            // Find user
            const user = await User.findOne({
                tenantId: tenant._id,
                email: email.toLowerCase(),
                isActive: true
            });

            if (!user) {
                throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
            }

            // Generate tokens
            const accessToken = AuthService.generateAccessToken(user);
            const refreshToken = AuthService.generateRefreshToken(user);

            // Save refresh token
            user.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                deviceInfo: req.headers['user-agent']
            });
            user.lastLogin = new Date();
            await user.save();

            logger.info(`User logged in: ${user.email}`);

            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        tenantId: user.tenantId,
                        profile: user.profile
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new AppError('Refresh token required', 400, 'BAD_REQUEST');
            }

            // Verify refresh token
            const payload = AuthService.verifyRefreshToken(refreshToken);

            // Find user and verify refresh token exists
            const user = await User.findById(payload.userId);
            if (!user || !user.isActive) {
                throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
            }

            const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
            if (!tokenExists) {
                throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
            }

            // Generate new access token
            const newAccessToken = AuthService.generateAccessToken(user);

            res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user (invalidate refresh token)
     */
    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const userId = req.user?.userId;

            if (userId && refreshToken) {
                const user = await User.findById(userId);
                if (user) {
                    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
                    await user.save();
                }
            }

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user profile
     */
    static async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await User.findById(req.user?.userId).select('-passwordHash -refreshTokens');

            if (!user) {
                throw new AppError('User not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}
