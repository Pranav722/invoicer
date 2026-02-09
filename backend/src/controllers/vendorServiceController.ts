import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../models/VendorService';
import { Service } from '../models/Service';
import { Vendor } from '../models/Vendor';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class VendorServiceController {
    /**
     * Get all services assigned to a vendor
     */
    static async getVendorServices(req: Request, res: Response, next: NextFunction) {
        try {
            const { vendorId } = req.params;
            const tenantId = req.tenantId!;

            // Validate vendor exists
            const vendor = await Vendor.findOne({
                _id: vendorId,
                tenantId,
                deletedAt: null
            });

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
            }

            // Get all services assigned to this vendor
            const vendorServices = await VendorService.find({
                vendorId,
                tenantId,
                isActive: true
            }).populate('serviceId');

            // Enrich with pricing logic
            const enrichedServices = vendorServices.map((vs: any) => {
                const service = vs.serviceId;

                if (!service) {
                    // Service was deleted, skip it
                    return null;
                }

                return {
                    id: service._id,
                    name: service.name,
                    description: service.description,
                    category: service.category,

                    // Use custom pricing if exists, else default
                    pricing: vs.customPricing || service.pricing,

                    // Use custom tax if exists, else default
                    taxable: vs.customTaxable !== undefined ? vs.customTaxable : service.taxable,
                    taxRate: vs.customTaxRate !== undefined ? vs.customTaxRate : service.taxRate,

                    // Metadata
                    vendorServiceId: vs._id,
                    isCustomPricing: !!vs.customPricing,
                    timesUsed: vs.timesUsed || 0
                };
            }).filter(Boolean); // Remove null entries

            res.status(200).json({
                success: true,
                data: {
                    vendor: {
                        id: vendor._id,
                        companyName: vendor.companyName
                    },
                    services: enrichedServices
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign service to vendor (Admin only)
     */
    static async assignService(req: Request, res: Response, next: NextFunction) {
        try {
            const { vendorId } = req.params;
            const { serviceId, customPricing, customTaxRate, customTaxable } = req.body;
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            // Validate vendor and service exist
            const [vendor, service] = await Promise.all([
                Vendor.findOne({ _id: vendorId, tenantId, deletedAt: null }),
                Service.findOne({ _id: serviceId, tenantId, deletedAt: null })
            ]);

            if (!vendor) {
                throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
            }
            if (!service) {
                throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
            }

            // Check if already assigned
            const existing = await VendorService.findOne({
                vendorId,
                serviceId,
                tenantId
            });

            if (existing) {
                throw new AppError(
                    'Service already assigned to this vendor',
                    400,
                    'DUPLICATE_ASSIGNMENT'
                );
            }

            // Create assignment
            const vendorService = await VendorService.create({
                tenantId,
                vendorId,
                serviceId,
                customPricing,
                customTaxRate,
                customTaxable,
                assignedBy: userId,
                isActive: true
            });

            logger.info(
                `Service ${service.name} assigned to vendor ${vendor.companyName} by user ${userId}`
            );

            res.status(201).json({
                success: true,
                data: vendorService
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update vendor service (e.g., custom pricing)
     */
    static async updateVendorService(req: Request, res: Response, next: NextFunction) {
        try {
            const { vendorId, vendorServiceId } = req.params;
            const updates = req.body;
            const tenantId = req.tenantId!;

            const vendorService = await VendorService.findOneAndUpdate(
                {
                    _id: vendorServiceId,
                    vendorId,
                    tenantId
                },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!vendorService) {
                throw new AppError('Vendor service not found', 404, 'NOT_FOUND');
            }

            logger.info(`Vendor service ${vendorServiceId} updated`);

            res.status(200).json({
                success: true,
                data: vendorService
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove service from vendor
     */
    static async removeService(req: Request, res: Response, next: NextFunction) {
        try {
            const { vendorId, vendorServiceId } = req.params;
            const tenantId = req.tenantId!;

            const vendorService = await VendorService.findOneAndDelete({
                _id: vendorServiceId,
                vendorId,
                tenantId
            });

            if (!vendorService) {
                throw new AppError('Vendor service not found', 404, 'NOT_FOUND');
            }

            logger.info(`Service removed from vendor: ${vendorServiceId}`);

            res.status(200).json({
                success: true,
                message: 'Service removed from vendor successfully'
            });

        } catch (error) {
            next(error);
        }
    }
}
