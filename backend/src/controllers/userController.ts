import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

export class UserController {
    /**
     * Get all users (employees) for tenant
     */
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const { role, isActive, page = 1, limit = 50 } = req.query;

            const query: any = {
                tenantId,
                deletedAt: null
            };

            if (role) query.role = role;
            if (isActive !== undefined) query.isActive = isActive === 'true';

            const skip = (Number(page) - 1) * Number(limit);

            const [users, total] = await Promise.all([
                User.find(query)
                    .select('-passwordHash -refreshTokens -twoFactorSecret')
                    .sort({ 'profile.lastName': 1 })
                    .skip(skip)
                    .limit(Number(limit)),
                User.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    users,
                    pagination: {
                        total,
                        page: Number(page),
                        limit: Number(limit),
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single user by ID
     */
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const user = await User.findOne({
                _id: id,
                tenantId,
                deletedAt: null
            }).select('-passwordHash -refreshTokens -twoFactorSecret');

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

    /**
     * Create new user/employee (Admin only)
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, profile, role, permissions } = req.body;
            const tenantId = req.tenantId!;

            // Check if user already exists
            const existingUser = await User.findOne({ tenantId, email, deletedAt: null });
            if (existingUser) {
                throw new AppError('User with this email already exists', 409, 'DUPLICATE_ERROR');
            }

            // Create user
            const user = await User.create({
                tenantId,
                email,
                passwordHash: password, // Will be hashed by pre-save hook
                profile,
                role: role || 'employee',
                permissions: permissions || [],
                isActive: true
            });

            logger.info(`User created: ${email} with role ${role}`);

            // Return without sensitive data
            const userObj = user.toObject() as any;
            delete userObj.passwordHash;
            delete userObj.refreshTokens;

            res.status(201).json({
                success: true,
                data: userObj
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const updates = req.body;

            // Don't allow password updates through this endpoint
            delete updates.passwordHash;
            delete updates.refreshTokens;

            const user = await User.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-passwordHash -refreshTokens -twoFactorSecret');

            if (!user) {
                throw new AppError('User not found', 404, 'NOT_FOUND');
            }

            logger.info(`User updated: ${user.email}`);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deactivate user (soft delete)
     */
    static async deactivate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const user = await User.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { isActive: false, deletedAt: new Date() } },
                { new: true }
            );

            if (!user) {
                throw new AppError('User not found', 404, 'NOT_FOUND');
            }

            logger.info(`User deactivated: ${user.email}`);

            res.status(200).json({
                success: true,
                message: 'User deactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change user role (Owner/Admin only)
     */
    static async changeRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const tenantId = req.tenantId!;

            const validRoles = ['viewer', 'employee', 'admin'];
            if (!validRoles.includes(role)) {
                throw new AppError('Invalid role', 400, 'INVALID_ROLE');
            }

            const user = await User.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { role } },
                { new: true }
            ).select('-passwordHash -refreshTokens -twoFactorSecret');

            if (!user) {
                throw new AppError('User not found', 404, 'NOT_FOUND');
            }

            logger.info(`User role updated: ${user.email} → ${role}`);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     */
    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            const tenantId = req.tenantId!;
            const requestingUserId = req.user!.userId;

            // Users can only change their own password unless they're admin
            if (id !== requestingUserId && req.user!.role !== 'owner' && req.user!.role !== 'admin') {
                throw new AppError('Unauthorized', 403, 'FORBIDDEN');
            }

            const user = await User.findOne({ _id: id, tenantId, deletedAt: null });
            if (!user) {
                throw new AppError('User not found', 404, 'NOT_FOUND');
            }

            // Verify current password (skip if admin changing another user's password)
            if (id === requestingUserId) {
                const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
                if (!isValidPassword) {
                    throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
                }
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 12);

            // Update password
            await User.findByIdAndUpdate(id, { $set: { passwordHash: newPasswordHash } });

            logger.info(`Password changed for user: ${user.email}`);

            res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}
