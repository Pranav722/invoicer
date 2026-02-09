import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
    tenantId: mongoose.Types.ObjectId;
    companyName: string;
    contactPerson?: string;
    email: string;
    phone?: string;

    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };

    paymentDetails: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        swiftCode?: string;
        upiId?: string;
        paypalEmail?: string;
    };

    signatureUrl?: string; // Digital Signature URL
    taxId?: string;
    website?: string;
    notes?: string;

    // Invoice Header & Footer (Manual)
    header: string;  // Required - manual invoice header
    footer: string;  // Required - manual invoice footer

    // Employee Assignment (RBAC)
    assignedEmployees: mongoose.Types.ObjectId[];  // Employees who can access this vendor

    // Metadata (denormalized for performance)
    totalInvoices: number;
    totalRevenue: number;
    outstandingAmount: number;

    tags: string[];

    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const VendorSchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        companyName: { type: String, required: true },
        contactPerson: String,
        email: { type: String, required: true },
        phone: {
            type: String,
            validate: {
                validator: function (v: string) {
                    return !v || /^\d{10}$/.test(v);
                },
                message: (props: any) => `${props.value} is not a valid 10-digit phone number!`
            }
        },

        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        },

        paymentDetails: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
            swiftCode: String,
            upiId: String,
            paypalEmail: String
        },

        signatureUrl: String, // Digital Signature
        taxId: String,
        website: String,
        notes: String,

        // Invoice Header & Footer (Manual Entry)
        header: {
            type: String,
            required: [true, 'Invoice header is required'],
            minlength: [10, 'Header must be at least 10 characters'],
            trim: true
        },
        footer: {
            type: String,
            required: [true, 'Invoice footer is required'],
            minlength: [10, 'Footer must be at least 10 characters'],
            trim: true
        },

        // Employee Assignment for RBAC
        assignedEmployees: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],

        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        outstandingAmount: { type: Number, default: 0 },

        tags: [String],

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

// Indexes
VendorSchema.index({ tenantId: 1, companyName: 1 });
VendorSchema.index({ tenantId: 1, email: 1 });
VendorSchema.index({ tenantId: 1, tags: 1 });
VendorSchema.index({ tenantId: 1, deletedAt: 1 });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
