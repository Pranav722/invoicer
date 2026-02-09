import { Request, Response, NextFunction } from 'express';
import { Vendor } from '../models/Vendor';

/**
 * RBAC Middleware
 * Strict role-based access control
 */

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        email: string;
        role: string;
    };
    tenantId?: string;
}

/**
 * Require specific roles
 * Usage: requireRole(['admin', 'owner'])
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Block employee self-registration
 * Only admin can create employee accounts
 */
export const blockEmployeeRegistration = (req: AuthRequest, res: Response, next: NextFunction) => {
    const { role } = req.body;

    if (role === 'employee') {
        return res.status(403).json({
            success: false,
            message: 'Employee accounts can only be created by administrators. Please contact your admin.'
        });
    }

    next();
};

/**
 * Check if employee has access to specific vendor
 * Usage: checkVendorAccess()
 */
export const checkVendorAccess = () => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Admin and owner have access to all vendors
            if (req.user.role === 'admin' || req.user.role === 'owner') {
                return next();
            }

            // Employee - check vendor access
            if (req.user.role === 'employee') {
                const vendorId = req.params.vendorId || req.body.vendorId;

                if (!vendorId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vendor ID required'
                    });
                }

                // Check if employee has access to this vendor
                const { User } = await import('../models/User');
                const employee = await User.findById(req.user.userId).select('assignedVendors');

                if (!employee || !employee.assignedVendors.includes(vendorId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have access to this vendor. Contact admin for access.'
                    });
                }

                return next();
            }

            // Default deny
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        } catch (error) {
            console.error('Vendor access check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking vendor access'
            });
        }
    };
};

/**
 * Enforce vendor exists before invoice creation
 * Usage: requireVendorExists()
 */
export const requireVendorExists = () => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const tenantId = req.user.tenantId;

            // Check if tenant has at least one vendor
            const vendorCount = await Vendor.countDocuments({
                tenantId,
                deletedAt: null
            });

            if (vendorCount === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No vendors available. Please create a vendor first before creating invoices.',
                    code: 'NO_VENDORS_EXIST'
                });
            }

            next();
        } catch (error) {
            console.error('Vendor existence check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking vendor existence'
            });
        }
    };
};

/**
 * Filter vendors based on employee assignment
 * Admin/Owner: All vendors
 * Employee: Only assigned vendors
 */
export const filterVendorsByRole = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // For employees, add filter to query
    if (req.user.role === 'employee') {
        req.query.assignedEmployee = req.user.userId;
    }

    next();
};
