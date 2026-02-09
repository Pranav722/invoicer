import { Request, Response, NextFunction } from 'express';
import { Payment } from '../models/Payment';
import { Invoice } from '../models/Invoice';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class PaymentController {
    /**
     * Record a new payment for an invoice
     * POST /api/v1/invoices/:id/payments
     */
    static async create(req: Request, res: Response, next: NextFunction) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id: invoiceId } = req.params;
            const { amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;
            const tenantId = req.tenantId!;
            const userId = req.user!.userId;

            // Validate invoice exists and belongs to tenant
            const invoice = await Invoice.findOne({
                _id: invoiceId,
                tenantId,
            }).session(session);

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            // Validate payment amount
            if (amount <= 0) {
                throw new AppError('Payment amount must be positive', 400, 'INVALID_AMOUNT');
            }

            if (amount > invoice.balanceDue) {
                throw new AppError(
                    `Payment amount ($${amount}) exceeds amount due ($${invoice.balanceDue})`,
                    400,
                    'AMOUNT_EXCEEDS_DUE'
                );
            }

            // Create payment record
            const payment = await Payment.create(
                [
                    {
                        invoiceId,
                        tenantId,
                        amount,
                        paymentDate: paymentDate || new Date(),
                        paymentMethod,
                        referenceNumber,
                        notes,
                        recordedBy: userId,
                    },
                ],
                { session }
            );

            // Update invoice amounts
            invoice.amountPaid = (invoice.amountPaid || 0) + amount;
            invoice.balanceDue = invoice.total - invoice.amountPaid;

            // Auto-update status if fully paid
            if (invoice.balanceDue <= 0) { // Changed to <= 0 for floating point safety
                invoice.status = 'paid';
            }

            await invoice.save({ session });

            await session.commitTransaction();

            logger.info(`Payment recorded: ${payment[0]._id} for invoice ${invoiceId}`);

            res.status(201).json({
                success: true,
                message: 'Payment recorded successfully',
                data: {
                    payment: payment[0],
                    invoice: {
                        _id: invoice._id,
                        invoiceNumber: invoice.invoiceNumber,
                        status: invoice.status,
                        amountPaid: invoice.amountPaid,
                        amountDue: invoice.balanceDue,
                        totalAmount: invoice.total,
                    },
                },
            });
        } catch (error) {
            await session.abortTransaction();
            next(error);
        } finally {
            session.endSession();
        }
    }

    /**
     * Get all payments for a specific invoice
     * GET /api/v1/invoices/:id/payments
     */
    static async getByInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: invoiceId } = req.params;
            const tenantId = req.tenantId!;

            // Verify invoice exists
            const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            // Get all payments for this invoice
            const payments = await Payment.find({ invoiceId, tenantId })
                .populate('recordedBy', 'profile.firstName profile.lastName email')
                .sort({ paymentDate: -1 });

            // Calculate summary
            const summary = {
                totalPaid: invoice.amountPaid,
                totalDue: invoice.balanceDue,
                invoiceTotal: invoice.total,
                paymentCount: payments.length,
            };

            res.json({
                success: true,
                data: {
                    payments,
                    summary,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all payments for the tenant with filtering
     * GET /api/v1/payments
     */
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId!;
            const {
                page = 1,
                limit = 20,
                sort = '-paymentDate',
                paymentMethod,
                startDate,
                endDate,
                minAmount,
                maxAmount,
            } = req.query;

            // Build filter  
            const filter: any = { tenantId };

            if (paymentMethod) {
                filter.paymentMethod = paymentMethod;
            }

            if (startDate || endDate) {
                filter.paymentDate = {};
                if (startDate) {
                    filter.paymentDate.$gte = new Date(startDate as string);
                }
                if (endDate) {
                    filter.paymentDate.$lte = new Date(endDate as string);
                }
            }

            if (minAmount || maxAmount) {
                filter.amount = {};
                if (minAmount) {
                    filter.amount.$gte = Number(minAmount);
                }
                if (maxAmount) {
                    filter.amount.$lte = Number(maxAmount);
                }
            }

            // Pagination
            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.min(100, Math.max(1, Number(limit)));
            const skip = (pageNum - 1) * limitNum;

            // Execute query
            const [payments, totalItems] = await Promise.all([
                Payment.find(filter)
                    .populate('invoiceId', 'invoiceNumber vendor')
                    .populate('recordedBy', 'profile.firstName profile.lastName')
                    .sort(sort as string)
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                Payment.countDocuments(filter),
            ]);

            // Calculate summary statistics
            const stats = await Payment.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: '$amount' },
                        paymentCount: { $sum: 1 },
                        avgPayment: { $avg: '$amount' },
                    },
                },
            ]);

            const summary = stats[0] || {
                totalPayments: 0,
                paymentCount: 0,
                avgPayment: 0,
            };

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalItems / limitNum),
                        totalItems,
                        itemsPerPage: limitNum,
                        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
                        hasPrevPage: pageNum > 1,
                    },
                    summary: {
                        totalPayments: summary.totalPayments,
                        paymentCount: summary.paymentCount,
                        averagePayment: Math.round(summary.avgPayment * 100) / 100,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a payment (and reverse invoice updates)
     * DELETE /api/v1/payments/:id
     */
    static async delete(req: Request, res: Response, next: NextFunction) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id } = req.params;
            const tenantId = req.tenantId!;

            // Find payment
            const payment = await Payment.findOne({ _id: id, tenantId }).session(session);
            if (!payment) {
                throw new AppError('Payment not found', 404, 'NOT_FOUND');
            }

            // Get associated invoice
            const invoice = await Invoice.findOne({
                _id: payment.invoiceId,
                tenantId,
            }).session(session);

            if (!invoice) {
                throw new AppError('Associated invoice not found', 404, 'NOT_FOUND');
            }

            // Reverse payment from invoice
            invoice.amountPaid = Math.max(0, (invoice.amountPaid || 0) - payment.amount);
            invoice.balanceDue = invoice.total - invoice.amountPaid;

            // Update status if needed
            if (invoice.status === 'paid' && invoice.balanceDue > 0) {
                invoice.status = 'sent';
            }

            await invoice.save({ session });

            // Delete payment
            await Payment.deleteOne({ _id: id }).session(session);

            await session.commitTransaction();

            logger.info(`Payment deleted: ${id}, reversed on invoice ${invoice._id}`);

            res.json({
                success: true,
                message: 'Payment deleted successfully',
            });
        } catch (error) {
            await session.abortTransaction();
            next(error);
        } finally {
            session.endSession();
        }
    }
}
