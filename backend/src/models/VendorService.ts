import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorService extends Document {
    tenantId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    serviceId: mongoose.Types.ObjectId;

    // Custom pricing for this vendor (overrides Service default)
    customPricing?: {
        type: 'fixed' | 'hourly' | 'daily';
        amount: number;
        currency: string;
    };

    // Custom tax settings for this vendor
    customTaxRate?: number;
    customTaxable?: boolean;

    // Usage tracking
    timesUsed: number;
    lastUsedAt?: Date;

    // Metadata
    isActive: boolean;
    assignedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const VendorServiceSchema: Schema = new Schema(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
            index: true
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
            index: true
        },

        customPricing: {
            type: {
                type: String,
                enum: ['fixed', 'hourly', 'daily']
            },
            amount: Number,
            currency: String
        },

        customTaxRate: Number,
        customTaxable: Boolean,

        timesUsed: { type: Number, default: 0 },
        lastUsedAt: Date,

        isActive: { type: Boolean, default: true },
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true
    }
);

// Compound indexes for performance
VendorServiceSchema.index({ tenantId: 1, vendorId: 1 });
VendorServiceSchema.index({ tenantId: 1, serviceId: 1 });
VendorServiceSchema.index({ vendorId: 1, isActive: 1 });

// Unique constraint: One vendor can't have the same service twice
VendorServiceSchema.index(
    { vendorId: 1, serviceId: 1 },
    { unique: true }
);

export const VendorService = mongoose.model<IVendorService>(
    'VendorService',
    VendorServiceSchema
);
