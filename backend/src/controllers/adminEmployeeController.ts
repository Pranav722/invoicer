import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

/**
 * Admin Employee Controller
 * Handles admin-only employee management operations
 */
export class AdminEmployeeController {
    /**
     * Create new employee (Admin Only)
     * Admin must create employees with credentials
     */
    static async createEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                email,
                password,
                profile,
                assignedVendors
            } = req.body;

            const tenantId = req.tenantId!;
            const adminUserId = req.user!.userId;

            // Validation
            if (!email || !password || !profile || !profile.firstName || !profile.lastName) {
                throw new AppError(
                    'Missing required fields: email, password, profile.firstName, profile.lastName',
                    400,
                    'VALIDATION_ERROR'
                );
            }

            // Password strength validation
            if (password.length < 8) {
                throw new AppError(
                    'Password must be at least 8 characters long',
                    400,
                    'WEAK_PASSWORD'
                );
            }

            // Check if user already exists
            const existingUser = await User.findOne({ tenantId, email, deletedat: null });
            if (existingUser) {
                throw new AppError(
                    'An employee with this email already exists',
                    409,
                    'DUPLICATE_EMAIL'
                );
            }

            // Validate assigned vendors exist
            if (assignedVendors && assignedVendors.length > 0) {
                const vendorCount = await Vendor.countDocuments({
                    _id: { $in: assignedVendors },
                    tenantId,
                    deletedAt: null
                });

                if (vendorCount !== assignedVendors.length) {
                    throw new AppError(
                        'One or more assigned vendors do not exist',
                        400,
                        'INVALID_VENDORS'
                    );
                }
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create employee
            const employee = await User.create({
                tenantId,
                email: email.toLowerCase(),
                passwordHash,
                profile: {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone || null,
                    avatar: profile.avatar || null
                },
                role: 'employee',
                assignedVendors: assignedVendors || [],
                createdByAdmin: true,  // Mark as admin-created
                permissions: [],
                isActive: true
            });

            // Update vendors to include this employee
            if (assignedVendors && assignedVendors.length > 0) {
                await Vendor.updateMany(
                    { _id: { $in: assignedVendors }, tenantId },
                    { $addToSet: { assignedEmployees: employee._id } }
                );
            }

            logger.info(`Employee created by admin: ${email} | AdminID: ${adminUserId}`);

            // Return without sensitive data
            const employeeObj: any = employee.toObject();
            delete employeeObj.passwordHash;
            delete employeeObj.refreshTokens;
            delete employeeObj.twoFactorSecret;

            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: employeeObj
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign vendor to employee
     */
    static async assignVendorToEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { vendorId } = req.body;
            const tenantId = req.tenantId!;

            // Validate employee exists and has employee role
            const employee = await User.findOne({
                _id: employeeId,
                tenantId,
                role: 'employee',
                deletedAt: null
            });

            if (!employee) {
                throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
            }

            // Validate vendor exists
            const vendor = await Vendor.findOne({
                _id: vendorId,
                tenantId,
                deletedAt: null
            });

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
            }

            // Add vendor to employee's assigned vendors if not already assigned
            await User.updateOne(
                { _id: employeeId },
                { $addToSet: { assignedVendors: vendorId } }
            );

            // Add employee to vendor's assigned employees
            await Vendor.updateOne(
                { _id: vendorId },
                { $addToSet: { assignedEmployees: employeeId } }
            );

            logger.info(`Vendor ${vendorId} assigned to employee ${employeeId}`);

            res.status(200).json({
                success: true,
                message: 'Vendor assigned to employee successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove vendor from employee
     */
    static async removeVendorFromEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, vendorId } = req.params;
            const tenantId = req.tenantId!;

            // Remove vendor from employee
            await User.updateOne(
                { _id: employeeId, tenantId },
                { $pull: { assignedVendors: vendorId } }
            );

            // Remove employee from vendor
            await Vendor.updateOne(
                { _id: vendorId, tenantId },
                { $pull: { assignedEmployees: employeeId } }
            );

            logger.info(`Vendor ${vendorId} removed from employee ${employeeId}`);

            res.status(200).json({
                success: true,
                message: 'Vendor access removed from employee'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get employee's assigned vendors
     */
    static async getEmployeeVendors(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const tenantId = req.tenantId!;

            const employee = await User.findOne({
                _id: employeeId,
                tenantId,
                role: 'employee',
                deletedAt: null
            }).populate('assignedVendors');

            if (!employee) {
                throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: {
                    employee: {
                        id: employee._id,
                        email: employee.email,
                        name: `${employee.profile.firstName} ${employee.profile.lastName}`
                    },
                    assignedVendors: employee.assignedVendors
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
