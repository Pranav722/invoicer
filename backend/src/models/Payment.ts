import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    invoiceId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    amount: number;
    paymentDate: Date;
    paymentMethod: 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'other';
    referenceNumber?: string;
    notes?: string;
    recordedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true,
            index: true,
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentDate: {
            type: Date,
            required: true,
            index: true,
        },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'credit_card', 'check', 'cash', 'other'],
            required: true,
        },
        referenceNumber: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
PaymentSchema.index({ tenantId: 1, invoiceId: 1 });
PaymentSchema.index({ tenantId: 1, paymentDate: -1 });
PaymentSchema.index({ tenantId: 1, paymentMethod: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
