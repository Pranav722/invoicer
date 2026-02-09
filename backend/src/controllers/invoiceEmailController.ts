import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/email/ResendEmailService';
import { Invoice } from '../models/Invoice';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Send invoice via email
 * POST /api/v1/invoices/:id/send
 */
export const sendInvoiceEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { to, cc, message, attachPDF = true } = req.body;
        const tenantId = req.tenantId!;

        // Get invoice
        const invoice = await Invoice.findOne({
            _id: id,
            tenantId,
            deletedAt: null,
        }).populate('vendorSnapshot');

        if (!invoice) {
            throw new AppError('Invoice not found', 404, 'NOT_FOUND');
        }

        // Prepare email data
        const emailData = {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.vendorSnapshot.companyName || (invoice.vendorSnapshot as any).contactPerson,
            clientEmail: to || invoice.vendorSnapshot.email,
            companyName: 'Your Company', // TODO: Get from tenant
            amount: invoice.total,
            dueDate: invoice.dueDate.toISOString(),
            invoiceUrl: `${process.env.FRONTEND_URL}/invoices/${invoice._id}`,
        };

        // Send email
        const result = await emailService.sendInvoiceEmail(emailData);

        if (!result.success) {
            throw new AppError(
                result.error || 'Failed to send email',
                500,
                'EMAIL_SEND_FAILED'
            );
        }

        // Update invoice status to 'sent'
        invoice.status = 'sent';
        invoice.emailSentAt = new Date();
        await invoice.save();

        logger.info(
            `Invoice ${invoice.invoiceNumber} sent via email to ${emailData.clientEmail}`
        );

        res.json({
            success: true,
            message: 'Invoice sent successfully',
            data: {
                emailId: result.messageId,
                sentAt: new Date().toISOString(),
                recipients: [emailData.clientEmail],
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available invoice templates
 * GET /api/v1/invoices/templates
 */
export const getTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const templates = [
            {
                id: 'classic-professional',
                name: 'Classic Professional',
                description: 'Traditional, balanced layout',
                category: 'professional',
                preview: '/templates/previews/classic-professional.png',
            },
            {
                id: 'modern-minimal',
                name: 'Modern Minimal',
                description: 'Clean, spacious design',
                category: 'modern',
                preview: '/templates/previews/modern-minimal.png',
            },
            {
                id: 'bold-statement',
                name: 'Bold Statement',
                description: 'Eye-catching header design',
                category: 'professional',
                preview: '/templates/previews/bold-statement.png',
            },
            {
                id: 'sidebar-layout',
                name: 'Sidebar Layout',
                description: 'Info in left sidebar',
                category: 'modern',
                preview: '/templates/previews/sidebar-layout.png',
            },
            {
                id: 'compact-executive',
                name: 'Compact Executive',
                description: 'Dense, professional layout',
                category: 'professional',
                preview: '/templates/previews/compact-executive.png',
            },
            {
                id: 'creative-agency',
                name: 'Creative Agency',
                description: 'Vibrant, modern design',
                category: 'creative',
                preview: '/templates/previews/creative-agency.png',
            },
            {
                id: 'split-screen',
                name: 'Split Screen',
                description: 'Divided layout design',
                category: 'modern',
                preview: '/templates/previews/split-screen.png',
            },
            {
                id: 'top-heavy',
                name: 'Top Heavy',
                description: 'Prominent header section',
                category: 'professional',
                preview: '/templates/previews/top-heavy.png',
            },
            {
                id: 'grid-mastery',
                name: 'Grid Mastery',
                description: 'Structured grid layout',
                category: 'modern',
                preview: '/templates/previews/grid-mastery.png',
            },
            {
                id: 'minimalist-luxury',
                name: 'Minimalist Luxury',
                description: 'Elegant simplicity',
                category: 'minimal',
                preview: '/templates/previews/minimalist-luxury.png',
            },
            {
                id: 'data-dense',
                name: 'Data Dense',
                description: 'Maximum information display',
                category: 'technical',
                preview: '/templates/previews/data-dense.png',
            },
            {
                id: 'floating-boxes',
                name: 'Floating Boxes',
                description: 'Card-based layout',
                category: 'creative',
                preview: '/templates/previews/floating-boxes.png',
            },
            {
                id: 'timeline-style',
                name: 'Timeline Style',
                description: 'Chronological layout',
                category: 'creative',
                preview: '/templates/previews/timeline-style.png',
            },
            {
                id: 'professional-certificate',
                name: 'Professional Certificate',
                description: 'Official document style',
                category: 'minimal',
                preview: '/templates/previews/professional-certificate.png',
            },
        ];

        res.json({
            success: true,
            data: {
                templates,
            },
        });
    } catch (error) {
        next(error);
    }
};
