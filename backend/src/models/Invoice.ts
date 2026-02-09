import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
    tenantId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    type: 'invoice' | 'proforma' | 'credit_note' | 'estimate';
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'canceled';

    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;

    vendorId?: mongoose.Types.ObjectId;
    vendorSnapshot: {
        companyName: string;
        email: string;
        address: any;
        phone?: string;
        taxId?: string;
        signatureUrl?: string;
        paymentDetails?: any;
    };

    createdBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;

    items: Array<{
        serviceId?: mongoose.Types.ObjectId;
        vendorServiceId?: mongoose.Types.ObjectId;
        description: string;
        quantity: number;
        rate: number;
        amount: number;
        taxable?: boolean;
        taxRate?: number;
        taxAmount?: number;
        isCustomService?: boolean;
    }>;


    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    total: number;
    amountPaid: number;
    balanceDue: number;
    currency: string;

    aiContent?: {
        header?: string;
        footer?: string;
        promptUsed?: string;
        tokensUsed?: number;
    };

    layoutId: string;
    customTemplate?: mongoose.Types.ObjectId;
    customizations?: {
        headerColor?: string;
        fontFamily?: string;
        showLogo?: boolean;
        showSignature?: boolean;
        signatureImage?: string;
    };

    pdfUrl?: string;
    pdfGeneratedAt?: Date;
    pdfWatermarked: boolean;

    emailSentAt?: Date;
    emailViewedAt?: Date;
    emailViewCount: number;

    paymentMethod?: string;
    paymentReference?: string;
    paymentNotes?: string;

    internalNotes?: string;
    clientNotes?: string;
    tags: string[];

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const InvoiceSchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        invoiceNumber: { type: String, required: true },
        type: {
            type: String,
            enum: ['invoice', 'proforma', 'credit_note', 'estimate'],
            default: 'invoice'
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'canceled'],
            default: 'draft'
        },

        issueDate: { type: Date, required: true },
        dueDate: { type: Date, required: true },
        paidDate: Date,

        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        vendorSnapshot: Schema.Types.Mixed,

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },

        items: [{
            serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
            vendorServiceId: { type: Schema.Types.ObjectId, ref: 'VendorService' },
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true },
            taxable: Boolean,
            taxRate: Number,
            taxAmount: Number,
            isCustomService: { type: Boolean, default: false }
        }],


        subtotal: { type: Number, required: true },
        taxAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        discountType: { type: String, enum: ['percentage', 'fixed'] },
        discountValue: Number,
        total: { type: Number, required: true },
        amountPaid: { type: Number, default: 0 },
        balanceDue: { type: Number, required: true },
        currency: { type: String, default: 'USD' },

        aiContent: {
            header: String,
            footer: String,
            promptUsed: String,
            tokensUsed: Number
        },

        layoutId: { type: String, required: true },
        customTemplate: { type: Schema.Types.ObjectId, ref: 'InvoiceTemplate' },
        customizations: {
            headerColor: String,
            fontFamily: String,
            showLogo: Boolean,
            showSignature: Boolean,
            signatureImage: String
        },

        pdfUrl: String,
        pdfGeneratedAt: Date,
        pdfWatermarked: { type: Boolean, default: true },

        emailSentAt: Date,
        emailViewedAt: Date,
        emailViewCount: { type: Number, default: 0 },

        paymentMethod: String,
        paymentReference: String,
        paymentNotes: String,

        internalNotes: String,
        clientNotes: String,
        tags: [String],
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

// Compound unique index for invoice number within tenant
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, vendorId: 1 });
InvoiceSchema.index({ tenantId: 1, createdBy: 1 });
InvoiceSchema.index({ tenantId: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, issueDate: -1 });
InvoiceSchema.index({ tenantId: 1, type: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
