import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ServiceController {
    /**
     * Create new service
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, category, pricing, taxable, taxRate } = req.body;
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            const service = await Service.create({
                tenantId,
                name,
                description,
                category,
                pricing,
                taxable: taxable || false,
                taxRate,
                isActive: true,
                createdBy: userId
            });

            logger.info(`Service created: ${service.name} by user ${userId}`);

            res.status(201).json({
                success: true,
                data: service
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all services with filtering
     */
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const { category, isActive, search, page = 1, limit = 100 } = req.query;

            const query: any = {
                tenantId,
                deletedAt: null
            };

            if (category) {
                query.category = category;
            }

            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            if (search) {
                query.$text = { $search: search as string };
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [services, total] = await Promise.all([
                Service.find(query)
                    .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Service.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    services,
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
     * Get single service by ID
     */
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const service = await Service.findOne({
                _id: id,
                tenantId,
                deletedAt: null
            });

            if (!service) {
                throw new AppError('Service not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: service
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update service
     */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const updates = req.body;

            const service = await Service.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!service) {
                throw new AppError('Service not found', 404, 'NOT_FOUND');
            }

            logger.info(`Service updated: ${service.name}`);

            res.status(200).json({
                success: true,
                data: service
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Soft delete service
     */
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const service = await Service.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { deletedAt: new Date() } },
                { new: true }
            );

            if (!service) {
                throw new AppError('Service not found', 404, 'NOT_FOUND');
            }

            logger.info(`Service deleted: ${service.name}`);

            res.status(200).json({
                success: true,
                message: 'Service deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get service categories
     */
    static async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;

            const categories = await Service.distinct('category', {
                tenantId,
                deletedAt: null
            });

            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }
}
