import { Request, Response, NextFunction } from 'express';
import { InvoiceTemplate } from '../models/InvoiceTemplate';
import type { CreateTemplateRequest, UpdateTemplateRequest, DuplicateTemplateRequest } from '../shared/types/InvoiceTemplate';

export class TemplateController {

    // Get all templates (presets + user's custom templates)
    async getTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { type, isPublic } = req.query;
            const tenantId = req.user?.tenantId;

            const query: any = {};

            if (type) {
                query.type = type;
            }

            // Get presets OR user's custom templates
            query.$or = [
                { type: 'preset', isPublic: true },
                { tenantId, type: 'custom' }
            ];

            const templates = await InvoiceTemplate.find(query)
                .sort({ isDefault: -1, usageCount: -1, createdAt: -1 })
                .lean();

            res.json(templates);
        } catch (error) {
            next(error);
        }
    }

    // Get preset templates only
    async getPresetTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const templates = await InvoiceTemplate.find({
                type: 'preset',
                isPublic: true
            })
                .sort({ name: 1 })
                .lean();

            res.json(templates);
        } catch (error) {
            next(error);
        }
    }

    // Get user's custom templates
    async getCustomTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.user?.tenantId;

            const templates = await InvoiceTemplate.find({
                tenantId,
                type: 'custom'
            })
                .sort({ isDefault: -1, updatedAt: -1 })
                .lean();

            res.json(templates);
        } catch (error) {
            next(error);
        }
    }

    // Get single template by ID
    async getTemplateById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId;

            const template = await InvoiceTemplate.findOne({
                _id: id,
                $or: [
                    { type: 'preset', isPublic: true },
                    { tenantId, type: 'custom' }
                ]
            }).lean();

            if (!template) {
                return res.status(404).json({ message: 'Template not found' });
            }

            res.json(template);
        } catch (error) {
            next(error);
        }
    }

    // Create custom template
    async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, config, isDefault, isPublic }: CreateTemplateRequest = req.body;
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;

            const template = new InvoiceTemplate({
                tenantId,
                name,
                type: 'custom',
                config,
                isDefault: isDefault || false,
                isPublic: isPublic || false,
                createdBy: userId,
                usageCount: 0
            });

            await template.save();

            res.status(201).json(template);
        } catch (error) {
            next(error);
        }
    }

    // Update template
    async updateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updates: UpdateTemplateRequest = req.body;
            const tenantId = req.user?.tenantId;

            const template = await InvoiceTemplate.findOne({
                _id: id,
                tenantId,
                type: 'custom'
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found or cannot be modified' });
            }

            // Update fields
            if (updates.name) template.name = updates.name;
            if (updates.config) {
                template.config = { ...template.config, ...updates.config };
            }
            if (typeof updates.isDefault !== 'undefined') {
                template.isDefault = updates.isDefault;
            }
            if (typeof updates.isPublic !== 'undefined') {
                template.isPublic = updates.isPublic;
            }

            await template.save();

            res.json(template);
        } catch (error) {
            next(error);
        }
    }

    // Delete template
    async deleteTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId;

            const template = await InvoiceTemplate.findOneAndDelete({
                _id: id,
                tenantId,
                type: 'custom'
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found or cannot be deleted' });
            }

            res.json({ message: 'Template deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // Duplicate template
    async duplicateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, modifications }: DuplicateTemplateRequest = req.body;
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;

            // Find original template
            const original = await InvoiceTemplate.findOne({
                _id: id,
                $or: [
                    { type: 'preset', isPublic: true },
                    { tenantId, type: 'custom' }
                ]
            });

            if (!original) {
                return res.status(404).json({ message: 'Template not found' });
            }

            // Create duplicate
            const originalObj = original.toObject();
            const duplicate = new InvoiceTemplate({
                tenantId,
                name: name || `${original.name} (Copy)`,
                type: 'custom',
                config: { ...originalObj.config, ...modifications },
                isDefault: false,
                isPublic: false,
                createdBy: userId,
                usageCount: 0
            });

            await duplicate.save();

            res.status(201).json(duplicate);
        } catch (error) {
            next(error);
        }
    }

    // Set as default template
    async setDefaultTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId;

            const template = await InvoiceTemplate.findOne({
                _id: id,
                tenantId,
                type: 'custom'
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found' });
            }

            template.isDefault = true;
            await template.save();

            res.json(template);
        } catch (error) {
            next(error);
        }
    }

    // Track template usage
    async trackUsage(templateId: string) {
        try {
            await InvoiceTemplate.findByIdAndUpdate(
                templateId,
                {
                    $inc: { usageCount: 1 },
                    lastUsedAt: new Date()
                }
            );
        } catch (error) {
            console.error('Error tracking template usage:', error);
        }
    }
}

export const templateController = new TemplateController();
