import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    category: string;

    pricing: {
        type: 'fixed' | 'hourly' | 'daily';
        amount: number;
        currency: string;
    };

    taxable: boolean;
    taxRate?: number;
    isActive: boolean;
    timesUsed: number;

    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const ServiceSchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true },
        description: String,
        category: { type: String, required: true },

        pricing: {
            type: { type: String, enum: ['fixed', 'hourly', 'daily'], required: true },
            amount: { type: Number, required: true },
            currency: { type: String, default: 'USD' }
        },

        taxable: { type: Boolean, default: false },
        taxRate: Number,
        isActive: { type: Boolean, default: true },
        timesUsed: { type: Number, default: 0 },

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

ServiceSchema.index({ tenantId: 1, category: 1 });
ServiceSchema.index({ tenantId: 1, isActive: 1 });
ServiceSchema.index({ tenantId: 1, name: 'text' });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
