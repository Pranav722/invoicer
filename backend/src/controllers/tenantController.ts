import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class TenantController {
    /**
     * Get current tenant info
     */
    static async getCurrent(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;

            const tenant = await Tenant.findById(tenantId);
            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: tenant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update tenant branding (Pro+ only)
     */
    static async updateBranding(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const branding = req.body;

            const tenant = await Tenant.findById(tenantId);
            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            // Check tier permission - DISABLED to allow updates for all users
            // if (tenant.subscription.tier === 'free') {
            //     throw new AppError('Branding customization requires Pro or Enterprise tier', 403, 'TIER_RESTRICTION');
            // }

            const updatedTenant = await Tenant.findByIdAndUpdate(
                tenantId,
                { $set: { branding } },
                { new: true, runValidators: true }
            );

            logger.info(`Branding updated for tenant: ${tenant.companyName}`);

            res.status(200).json({
                success: true,
                data: updatedTenant
            });
        } catch (error) {
            next(error);
        }
    }


    /**
     * Update tenant profile (Company Info & Payment Details)
     */
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const {
                companyName,
                email,
                phone,
                website,
                taxId,
                address,
                paymentDetails
            } = req.body;

            const updateData: any = {};
            if (companyName) updateData.companyName = companyName;
            if (email) updateData.ownerEmail = email; // Map email to ownerEmail
            // We might need to store company email separately if ownerEmail is login email
            // For now, let's assume branding.phone/website/address are the target

            // Build branding update
            const brandingUpdate: any = {};
            if (phone) brandingUpdate['branding.phone'] = phone;
            if (website) brandingUpdate['branding.website'] = website;
            if (taxId) brandingUpdate['branding.taxId'] = taxId;
            if (address) brandingUpdate['branding.companyAddress'] = typeof address === 'string' ? address : `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;

            // Payment details
            if (paymentDetails) updateData.paymentDetails = paymentDetails;

            const tenant = await Tenant.findByIdAndUpdate(
                tenantId,
                {
                    $set: { ...updateData, ...brandingUpdate }
                },
                { new: true, runValidators: true }
            );

            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            logger.info(`Profile updated for tenant: ${tenant.companyName}`);

            res.status(200).json({
                success: true,
                data: tenant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update tenant settings
     */
    static async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const settings = req.body;

            const tenant = await Tenant.findByIdAndUpdate(
                tenantId,
                { $set: { settings } },
                { new: true, runValidators: true }
            );

            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            logger.info(`Settings updated for tenant: ${tenant.companyName}`);

            res.status(200).json({
                success: true,
                data: tenant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get subscription info
     */
    static async getSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;

            const tenant = await Tenant.findById(tenantId).select('subscription usage');
            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: {
                    subscription: tenant.subscription,
                    usage: tenant.usage
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
