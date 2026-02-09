import { Request, Response, NextFunction } from 'express';
import { Vendor } from '../models/Vendor';
import { User } from '../models/User';

/**
 * Employee Vendor Controller
 * Handles employee-specific vendor operations
 */
export class EmployeeVendorController {
    /**
     * Get assigned vendors for logged-in employee
     */
    static async getAssignedVendors(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const tenantId = req.tenantId!;

            // Get employee with assigned vendors
            const employee = await User.findOne({
                _id: userId,
                tenantId,
                role: 'employee',
                deletedAt: null
            }).lean();

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee not found'
                });
            }

            // Get vendor details
            const vendors = await Vendor.find({
                _id: { $in: employee.assignedVendors || [] },
                tenantId,
                deletedAt: null
            }).select('companyName email phone address header footer');

            res.status(200).json({
                success: true,
                data: vendors
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Check if any vendors exist
     * Used to enable/disable invoice creation button
     */
    static async checkVendorExists(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            let vendorCount = 0;

            if (userRole === 'employee') {
                // Employee: check assigned vendors
                const employee = await User.findOne({
                    _id: userId,
                    tenantId,
                    deletedAt: null
                }).select('assignedVendors');

                vendorCount = employee?.assignedVendors?.length || 0;
            } else {
                // Admin/Owner: check all vendors
                vendorCount = await Vendor.countDocuments({
                    tenantId,
                    deletedAt: null
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    vendorsExist: vendorCount > 0,
                    vendorCount
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get vendor header/footer for invoice
     */
    static async getVendorHeaderFooter(req: Request, res: Response, next: NextFunction) {
        try {
            const { vendorId } = req.params;
            const tenantId = req.tenantId!;

            const vendor = await Vendor.findOne({
                _id: vendorId,
                tenantId,
                deletedAt: null
            }).select('companyName header footer');

            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    vendorId: vendor._id,
                    companyName: vendor.companyName,
                    header: vendor.header,
                    footer: vendor.footer
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
