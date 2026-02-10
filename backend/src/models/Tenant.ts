import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    companyName: string;
    subdomain: string;
    customDomain?: string;
    ownerEmail: string;
    ownerUserId: mongoose.Types.ObjectId;

    branding: {
        logo?: string;
        primaryColor?: string;
        accentColor?: string;
        companyAddress?: string;
        phone?: string;
        website?: string;
        taxId?: string;
        signatureUrl?: string;
    };

    paymentDetails?: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        routingNumber?: string;
        swiftCode?: string;
        iban?: string;
        ifscCode?: string;
    };

    subscription: {
        tier: 'free' | 'pro' | 'enterprise';
        status: 'active' | 'trialing' | 'past_due' | 'canceled';
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        currentPeriodStart?: Date;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd: boolean;
    };

    usage: {
        invoicesThisMonth: number;
        employeesCount: number;
        vendorsCount: number;
        servicesCount: number;
        aiTokensUsedThisMonth: number;
    };

    settings: {
        defaultCurrency: string;
        invoiceNumberPrefix: string;
        invoiceNumberStart: number;
        defaultPaymentTerms: string;
        timezone: string;
        dateFormat: string;
        maxDueDateDays: number | null;
        autoEmailInvoices: boolean; // NEW
    };

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const TenantSchema: Schema = new Schema(
    {
        companyName: { type: String, required: true },
        subdomain: { type: String, required: true, unique: true, lowercase: true },
        customDomain: { type: String, unique: true, sparse: true },
        ownerEmail: { type: String, required: true },
        ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        branding: {
            logo: String,
            primaryColor: { type: String, default: '#3B82F6' },
            accentColor: { type: String, default: '#10B981' },
            companyAddress: String,
            phone: String,
            website: String,
            taxId: String,
            signatureUrl: String // Digital Signature key/url
        },

        paymentDetails: {
            bankName: String,
            accountName: String,
            accountNumber: String,
            routingNumber: String, // Sort Code / Routing
            swiftCode: String,
            iban: String,
            ifscCode: String
        },

        subscription: {
            tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
            status: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled'], default: 'trialing' },
            stripeCustomerId: String,
            stripeSubscriptionId: String,
            currentPeriodStart: Date,
            currentPeriodEnd: Date,
            cancelAtPeriodEnd: { type: Boolean, default: false }
        },

        usage: {
            invoicesThisMonth: { type: Number, default: 0 },
            employeesCount: { type: Number, default: 1 },
            vendorsCount: { type: Number, default: 0 },
            servicesCount: { type: Number, default: 0 },
            aiTokensUsedThisMonth: { type: Number, default: 0 }
        },

        settings: {
            defaultCurrency: { type: String, default: 'USD' },
            invoiceNumberPrefix: { type: String, default: 'INV-' },
            invoiceNumberStart: { type: Number, default: 1000 },
            defaultPaymentTerms: { type: String, default: 'Net 30' },
            timezone: { type: String, default: 'UTC' },
            dateFormat: { type: String, default: 'DD/MM/YYYY' },
            maxDueDateDays: { type: Number, default: null }, // Limit due date selection (e.g. 30 days)
            autoEmailInvoices: { type: Boolean, default: false } // NEW: Auto-email toggle
        },

        deletedAt: Date
    },
    {
        timestamps: true
    }
);

// Indexes
TenantSchema.index({ subdomain: 1 }, { unique: true });
TenantSchema.index({ ownerEmail: 1 });
TenantSchema.index({ 'subscription.tier': 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
