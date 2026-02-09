import { Request, Response, NextFunction } from 'express';
import { Vendor } from '../models/Vendor';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class VendorController {
    /**
     * Create new vendor
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { companyName, email, phone, address, paymentDetails, signatureUrl, taxId, website, notes, tags, header, footer } = req.body;
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            // Check if vendor already exists
            const existingVendor = await Vendor.findOne({
                tenantId,
                email,
                deletedAt: null
            });

            if (existingVendor) {
                throw new AppError('Vendor with this email already exists', 409, 'DUPLICATE_ERROR');
            }

            const vendor = await Vendor.create({
                tenantId,
                companyName,
                email,
                phone,
                address,
                paymentDetails,
                signatureUrl,
                taxId,
                website,
                notes,
                header,
                footer,
                tags: tags || [],
                createdBy: userId
            });

            logger.info(`Vendor created: ${vendor.companyName} by user ${userId}`);

            res.status(201).json({
                success: true,
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all vendors with filtering and search
     */
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const { search, tag, page = 1, limit = 50 } = req.query;

            const query: any = {
                tenantId,
                deletedAt: null
            };

            // Text search
            if (search) {
                query.$text = { $search: search as string };
            }

            // Tag filter
            if (tag) {
                query.tags = tag;
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [vendors, total] = await Promise.all([
                Vendor.find(query)
                    .sort(search ? { score: { $meta: 'textScore' } } : { companyName: 1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .select('-paymentDetails.accountNumber'), // Hide sensitive data
                Vendor.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    vendors,
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
     * Get single vendor by ID
     */
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const vendor = await Vendor.findOne({
                _id: id,
                tenantId,
                deletedAt: null
            });

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update vendor
     */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const updates = req.body;

            const vendor = await Vendor.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'NOT_FOUND');
            }

            logger.info(`Vendor updated: ${vendor.companyName}`);

            res.status(200).json({
                success: true,
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Soft delete vendor
     */
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const vendor = await Vendor.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { deletedAt: new Date() } },
                { new: true }
            );

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'NOT_FOUND');
            }

            logger.info(`Vendor deleted: ${vendor.companyName}`);

            res.status(200).json({
                success: true,
                message: 'Vendor deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get vendor's invoice history
     */
    static async getInvoices(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const { page = 1, limit = 20 } = req.query;

            // Verify vendor exists
            const vendor = await Vendor.findOne({
                _id: id,
                tenantId,
                deletedAt: null
            });

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'NOT_FOUND');
            }

            // Import Invoice model here to avoid circular dependency
            const { Invoice } = require('../models/Invoice');

            const skip = (Number(page) - 1) * Number(limit);

            const [invoices, total] = await Promise.all([
                Invoice.find({
                    tenantId,
                    vendorId: id,
                    deletedAt: null
                })
                    .sort({ issueDate: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .select('invoiceNumber type status issueDate dueDate total amountPaid balanceDue'),
                Invoice.countDocuments({
                    tenantId,
                    vendorId: id,
                    deletedAt: null
                })
            ]);

            res.status(200).json({
                success: true,
                data: {
                    vendor: {
                        id: vendor._id,
                        companyName: vendor.companyName
                    },
                    invoices,
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
}
