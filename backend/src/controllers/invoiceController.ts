import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';
import { Vendor } from '../models/Vendor';
import { Tenant } from '../models/Tenant';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { aiService } from '../services/aiService';
import { puppeteerPDFService } from '../services/pdf/PuppeteerPDFService';
import { convertAmountToWords } from '../utils/amountToWords';
import mongoose from 'mongoose';

export class InvoiceController {
    /**
     * Create new invoice with optional AI generation
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                vendorId,
                items,
                issueDate,
                dueDate,
                currency,
                discountAmount,
                discountType,
                notes
            } = req.body;

            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            // Validate vendor exists if vendorId is provided
            let vendor = null;
            if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
                vendor = await Vendor.findOne({ _id: vendorId, tenantId, deletedAt: null });
            }

            // Calculate totals
            let subtotal = 0;
            let totalTax = 0;

            const processedItems = (items || []).map((item: any) => {
                const quantity = Number(item.quantity) || 1;
                const rate = Number(item.rate) || 0;
                const amount = quantity * rate;
                const itemTax = item.taxable ? (amount * (item.taxRate || 0)) / 100 : 0;

                subtotal += amount;
                totalTax += itemTax;

                return {
                    description: item.description || 'Service',
                    quantity,
                    rate,
                    amount,
                    taxable: item.taxable || false,
                    taxRate: item.taxRate || 0,
                    taxAmount: itemTax
                };
            });

            const finalDiscountAmount = Number(discountAmount) || 0;
            const total = subtotal + totalTax - finalDiscountAmount;

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber(tenantId);

            // Create vendor snapshot (The ISSUER of the invoice)
            const vendorSnapshot = vendor ? {
                companyName: vendor.companyName,
                contactPerson: vendor.contactPerson,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                taxId: vendor.taxId,
                signatureUrl: vendor.signatureUrl,
                paymentDetails: vendor.paymentDetails
            } : (req.body.vendorSnapshot || {});

            // Create invoice
            const invoice = new Invoice({
                tenantId,
                invoiceNumber,
                type: req.body.type || 'invoice',
                status: req.body.status === 'sent' ? 'sent' : 'draft',
                issueDate: issueDate || new Date(),
                dueDate: dueDate || new Date(),
                vendorId: vendorId && mongoose.Types.ObjectId.isValid(vendorId) ? vendorId : undefined,
                vendorSnapshot,
                items: processedItems,
                createdBy: userId,
                subtotal,
                taxAmount: totalTax,
                discountAmount: finalDiscountAmount,
                discountType: discountType || null,
                total,
                amountPaid: 0,
                balanceDue: total,
                currency: currency || 'USD',
                layoutId: req.body.templateId || 'modern-minimal',
                internalNotes: req.body.internalNotes || notes,
                clientNotes: req.body.clientNotes
            });

            await invoice.save();

            logger.info(`Invoice created: ${invoice.invoiceNumber} by user ${userId}`);

            res.status(201).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all invoices with filtering
     */
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const {
                status,
                vendorId,
                type,
                fromDate,
                toDate,
                search,
                page = 1,
                limit = 50
            } = req.query;

            const query: any = {
                tenantId,
                deletedAt: null
            };

            if (status) query.status = status;
            if (vendorId) query.vendorId = vendorId;
            if (type) query.type = type;

            if (fromDate || toDate) {
                query.issueDate = {};
                if (fromDate) query.issueDate.$gte = new Date(fromDate as string);
                if (toDate) query.issueDate.$lte = new Date(toDate as string);
            }

            if (search) {
                query.$text = { $search: search as string };
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [invoices, total] = await Promise.all([
                Invoice.find(query)
                    .sort({ issueDate: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .select('invoiceNumber type status issueDate dueDate vendorSnapshot total amountPaid balanceDue currency'),
                Invoice.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: {
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

    /**
     * Get single invoice by ID
     */
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const invoice = await Invoice.findOne({
                _id: id,
                tenantId,
                deletedAt: null
            });

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update invoice
     */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const updates = req.body;

            // Can't update paid invoices
            const existingInvoice = await Invoice.findOne({ _id: id, tenantId });
            if (existingInvoice?.status === 'paid') {
                throw new AppError('Cannot update paid invoices', 400, 'INVALID_OPERATION');
            }

            const invoice = await Invoice.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            logger.info(`Invoice updated: ${invoice.invoiceNumber}`);

            res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete invoice (soft delete)
     */
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            const invoice = await Invoice.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { deletedAt: new Date() } },
                { new: true }
            );

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            logger.info(`Invoice deleted: ${invoice.invoiceNumber}`);

            res.status(200).json({
                success: true,
                message: 'Invoice deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate PDF for invoice using Puppeteer
     */
    static async generatePDF(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { templateId = 'classic-professional' } = req.query;
            const tenantId = req.tenantId!;

            // Get invoice with vendor details
            const invoice = await Invoice.findOne({ _id: id, tenantId, deletedAt: null })
                .populate('vendorId', 'companyName contactPerson email phone address taxId');

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            // Get tenant details
            const tenant = await Tenant.findById(tenantId);
            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            const vendor = invoice.vendorId as any;

            // Prepare invoice data for template
            const invoiceData = {
                invoiceNumber: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,

                // Client details - prioritize clientNotes if available (manual entry in UI)
                clientName: '',
                clientAddress: '',
                clientCity: '',
                clientState: '',
                clientZip: '',
                clientEmail: '',
                clientPhone: '',
                ...(() => {
                    try {
                        return invoice.clientNotes ? JSON.parse(invoice.clientNotes) : {};
                    } catch (e) { return {}; }
                })(),

                // If clientNotes didn't have it, fallback to vendor (though in this app vendor is often issuer)
                ...(vendor ? {
                    clientName: vendor.companyName,
                    clientAddress: vendor.address?.street,
                    clientCity: vendor.address?.city,
                    clientState: vendor.address?.state,
                    clientZip: vendor.address?.zip,
                    clientEmail: vendor.email,
                    clientPhone: vendor.phone,
                } : {}),

                // Company (Tenant) details - can be overridden by vendorSnapshot (Issuer Profile)
                companyName: invoice.vendorSnapshot?.companyName || tenant.companyName,
                companyAddress: invoice.vendorSnapshot?.address || tenant.branding?.companyAddress,
                companyEmail: invoice.vendorSnapshot?.email || tenant.ownerEmail,
                companyPhone: invoice.vendorSnapshot?.phone || tenant.branding?.phone,
                companyWebsite: (invoice.vendorSnapshot as any)?.website || tenant.branding?.website,
                signature: invoice.vendorSnapshot?.signatureUrl || tenant.branding?.signatureUrl,
                paymentDetails: invoice.vendorSnapshot?.paymentDetails || tenant.paymentDetails,

                // Line items
                lineItems: invoice.items,

                // Amounts
                subtotal: invoice.subtotal,
                taxRate: 0,
                taxAmount: invoice.taxAmount || 0,
                discountAmount: invoice.discountAmount || 0,
                totalAmount: invoice.total,
                currency: invoice.currency || 'USD',

                // Amount in words
                amountInWords: convertAmountToWords({ amount: invoice.total, currency: invoice.currency as any || 'USD' }),

                // Notes
                notes: invoice.internalNotes,
                paymentInstructions: tenant.settings?.defaultPaymentTerms,
            };

            // Check if watermark needed (free tier)
            const watermark = tenant.subscription?.tier === 'free';

            // Generate PDF using Puppeteer
            const pdfBuffer = await puppeteerPDFService.generateInvoicePDF(invoiceData, {
                templateId: templateId as string,
                watermark,
                watermarkText: 'SAMPLE - UPGRADE TO REMOVE',
            });

            // Save PDF metadata to invoice
            await Invoice.findByIdAndUpdate(id, {
                $set: {
                    pdfGeneratedAt: new Date(),
                    pdfWatermarked: watermark,
                    pdfSize: pdfBuffer.length,
                    pdfTemplate: templateId,
                },
            });

            logger.info(`PDF generated for invoice ${invoice.invoiceNumber} using ${templateId}`);

            res.status(200).json({
                success: true,
                data: {
                    size: pdfBuffer.length,
                    sizeKB: (pdfBuffer.length / 1024).toFixed(1),
                    watermarked: watermark,
                    template: templateId,
                    generatedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download PDF (generates on-the-fly if needed)
     */
    static async downloadPDF(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { templateId = 'classic-professional' } = req.query;
            const tenantId = req.tenantId!;

            // Get invoice
            const invoice = await Invoice.findOne({ _id: id, tenantId, deletedAt: null })
                .populate('vendorId');

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            const tenant = await Tenant.findById(tenantId);
            const vendor = invoice.vendorId as any;

            // Prepare invoice data
            const invoiceData = {
                invoiceNumber: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,

                // Client details - prioritize clientNotes if available (manual entry in UI)
                clientName: '',
                clientAddress: '',
                clientCity: '',
                clientState: '',
                clientZip: '',
                clientEmail: '',
                clientPhone: '',
                ...(() => {
                    try {
                        return invoice.clientNotes ? JSON.parse(invoice.clientNotes) : {};
                    } catch (e) { return {}; }
                })(),

                // If clientNotes didn't have it, fallback to vendor (though in this app vendor is often issuer)
                ...(vendor ? {
                    clientName: vendor.companyName,
                    clientAddress: vendor.address?.street,
                    clientCity: vendor.address?.city,
                    clientState: vendor.address?.state,
                    clientZip: vendor.address?.zip,
                    clientEmail: vendor.email,
                    clientPhone: vendor.phone,
                } : {}),

                // Company (Tenant) details - can be overridden by vendorSnapshot (Issuer Profile)
                companyName: invoice.vendorSnapshot?.companyName || tenant?.companyName,
                companyAddress: invoice.vendorSnapshot?.address || tenant?.branding?.companyAddress,
                companyEmail: invoice.vendorSnapshot?.email || tenant?.ownerEmail,
                companyPhone: invoice.vendorSnapshot?.phone || tenant?.branding?.phone,
                companyWebsite: (invoice.vendorSnapshot as any)?.website || tenant?.branding?.website,
                signature: invoice.vendorSnapshot?.signatureUrl || tenant?.branding?.signatureUrl,
                paymentDetails: invoice.vendorSnapshot?.paymentDetails || tenant?.paymentDetails,

                lineItems: invoice.items,
                subtotal: invoice.subtotal,
                taxRate: 0,
                taxAmount: invoice.taxAmount || 0,
                discountAmount: invoice.discountAmount || 0,
                totalAmount: invoice.total,
                currency: invoice.currency || 'USD',
                amountInWords: convertAmountToWords({ amount: invoice.total, currency: invoice.currency as any || 'USD' }),
                notes: invoice.internalNotes,
                paymentInstructions: tenant?.settings?.defaultPaymentTerms,
            };

            // Generate PDF
            const watermark = tenant?.subscription?.tier === 'free';
            const pdfBuffer = await puppeteerPDFService.generateInvoicePDF(invoiceData, {
                templateId: templateId as string,
                watermark,
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            // Send PDF
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update invoice status
     */
    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const tenantId = req.tenantId!;

            const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'canceled'];
            if (!validStatuses.includes(status)) {
                throw new AppError('Invalid status', 400, 'INVALID_STATUS');
            }

            const invoice = await Invoice.findOneAndUpdate(
                { _id: id, tenantId, deletedAt: null },
                { $set: { status, sentDate: status === 'sent' ? new Date() : undefined } },
                { new: true }
            );

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            logger.info(`Invoice ${invoice.invoiceNumber} status updated to: ${status}`);

            res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Duplicate invoice
     */
    static async duplicate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            const originalInvoice = await Invoice.findOne({ _id: id, tenantId, deletedAt: null });
            if (!originalInvoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            // Generate new invoice number
            const invoiceNumber = await this.generateInvoiceNumber(tenantId);

            // Create duplicate
            const duplicateData: any = originalInvoice.toObject();
            delete duplicateData._id;
            delete duplicateData.createdAt;
            delete duplicateData.updatedAt;

            const duplicate = await Invoice.create({
                ...duplicateData,
                invoiceNumber,
                status: 'draft',
                issueDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                createdBy: userId,
                pdfUrl: null,
                pdfGeneratedAt: null,
                emailSentAt: null,
                paidDate: null
            });

            logger.info(`Invoice duplicated: ${originalInvoice.invoiceNumber} → ${duplicate.invoiceNumber}`);

            res.status(201).json({
                success: true,
                data: duplicate
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get invoice dashboard stats
     */
    static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;

            const stats = await Invoice.aggregate([
                { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), deletedAt: null } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$total' }
                    }
                }
            ]);

            const totalInvoices = await Invoice.countDocuments({ tenantId, deletedAt: null });
            const totalRevenue = await Invoice.aggregate([
                { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), deletedAt: null } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);

            const outstanding = await Invoice.aggregate([
                {
                    $match: {
                        tenantId: new mongoose.Types.ObjectId(tenantId),
                        status: { $in: ['sent', 'viewed', 'overdue'] },
                        deletedAt: null
                    }
                },
                { $group: { _id: null, total: { $sum: '$balanceDue' } } }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    totalInvoices,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    outstandingAmount: outstanding[0]?.total || 0,
                    byStatus: stats
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate unique invoice number
     */
    /**
     * Send invoice via email
     */
    static async sendEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { templateId = 'classic-professional' } = req.body;
            const tenantId = req.tenantId!;

            // 1. Get invoice
            const invoice = await Invoice.findOne({ _id: id, tenantId, deletedAt: null })
                .populate('vendorId');

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            const tenant = await Tenant.findById(tenantId);
            if (!tenant) throw new AppError('Tenant not found', 404, 'NOT_FOUND');

            const vendor = invoice.vendorId as any;

            // 2. Refresh PDF data (similar to generatePDF)
            const invoiceData = {
                invoiceNumber: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                companyName: tenant.companyName,
                companyAddress: tenant.branding?.companyAddress,
                companyEmail: tenant.ownerEmail,
                companyPhone: tenant.branding?.phone,
                companyWebsite: tenant.branding?.website,
                // Client Info
                clientName: vendor?.companyName || invoice.vendorSnapshot?.companyName,
                clientAddress: vendor?.address?.street || (invoice.vendorSnapshot?.address as any)?.street,
                clientCity: vendor?.address?.city || (invoice.vendorSnapshot?.address as any)?.city,
                clientState: vendor?.address?.state || (invoice.vendorSnapshot?.address as any)?.state,
                clientZip: vendor?.address?.zip || (invoice.vendorSnapshot?.address as any)?.zip,
                clientEmail: vendor?.email || invoice.vendorSnapshot?.email,
                clientPhone: vendor?.phone || (invoice.vendorSnapshot as any)?.phone,
                lineItems: invoice.items,
                subtotal: invoice.subtotal,
                taxRate: 0,
                taxAmount: invoice.taxAmount || 0,
                discountAmount: invoice.discountAmount || 0,
                totalAmount: invoice.total,
                currency: invoice.currency || 'USD',
                amountInWords: convertAmountToWords({ amount: invoice.total, currency: invoice.currency as any || 'USD' }),
                notes: invoice.internalNotes,
                paymentInstructions: tenant.settings?.defaultPaymentTerms,
            };

            // 3. Generate PDF Buffer
            const watermark = tenant.subscription?.tier === 'free';
            const pdfBuffer = await puppeteerPDFService.generateInvoicePDF(invoiceData, {
                templateId: templateId as string,
                watermark,
            });

            // 4. Send Email using Nodemailer (assuming transporter is available globally or imported)
            // Ideally move this to a separate emailService, but implementing here for speed as requested.
            const nodemailer = require('nodemailer');

            // NOTE: In production, configure these via env vars
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const mailOptions = {
                from: `"${tenant.companyName}" <${tenant.ownerEmail}>`, // sender address
                to: invoiceData.clientEmail, // list of receivers
                subject: `Invoice ${invoice.invoiceNumber} from ${tenant.companyName}`, // Subject line
                text: `Dear ${invoiceData.clientName},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.total}. \n\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nThank you for your business.\n\nBest regards,\n${tenant.companyName}`, // plain text body
                html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h2>Invoice ${invoice.invoiceNumber}</h2>
                        <p>Dear ${invoiceData.clientName},</p>
                        <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for <strong>${invoice.currency} ${invoice.total}</strong>.</p>
                        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                        <p>Your prompt payment is greatly appreciated.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>${tenant.companyName}</strong></p>
                    </div>
                `,
                attachments: [
                    {
                        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
                        content: pdfBuffer
                    }
                ]
            };

            // Send mail with defined transport object
            await transporter.sendMail(mailOptions);

            // 5. Update Invoice Status
            await Invoice.findByIdAndUpdate(id, {
                $set: {
                    status: 'sent',
                    emailSentAt: new Date(),
                    pdfGeneratedAt: new Date(), // Implicitly generated
                }
            });

            logger.info(`Invoice ${invoice.invoiceNumber} emailed to ${invoiceData.clientEmail}`);

            res.status(200).json({
                success: true,
                message: 'Invoice sent successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    private static async generateInvoiceNumber(tenantId: string): Promise<string> {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
        }

        const prefix = tenant.settings?.invoiceNumberPrefix || 'INV-';
        const padding = 4; // Default padding for invoice numbers

        // Get last invoice number
        const lastInvoice = await Invoice.findOne({ tenantId })
            .sort({ createdAt: -1 })
            .select('invoiceNumber');

        let nextNumber = tenant.settings?.invoiceNumberStart || 1000;

        if (lastInvoice?.invoiceNumber) {
            const lastNumberStr = lastInvoice.invoiceNumber.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(padding, '0')}`;
    }
}
