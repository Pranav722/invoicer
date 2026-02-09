import mongoose, { Schema, Document } from 'mongoose';
import type { TemplateConfig } from '../shared/types/InvoiceTemplate';

export interface IInvoiceTemplate extends Document {
    tenantId?: mongoose.Types.ObjectId;

    name: string;
    type: 'preset' | 'custom';
    isDefault: boolean;
    createdBy?: mongoose.Types.ObjectId;
    isPublic: boolean;

    config: TemplateConfig;

    usageCount: number;
    lastUsedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const FontConfigSchema = new Schema({
    family: { type: String, required: true },
    weight: { type: Number, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
    letterSpacing: { type: Number },
    lineHeight: { type: Number }
}, { _id: false });

const ColorPaletteSchema = new Schema({
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
    accent: { type: String, required: true },
    text: { type: String, required: true },
    textMuted: { type: String, required: true },
    background: { type: String, required: true },
    border: { type: String, required: true },
    tableBg: { type: String, required: true },
    tableHeaderBg: { type: String, required: true },
    tableHeaderText: { type: String, required: true }
}, { _id: false });

const BorderConfigSchema = new Schema({
    width: { type: Number, required: true },
    color: { type: String, required: true },
    style: { type: String, enum: ['solid', 'dashed', 'dotted'], required: true }
}, { _id: false });

const TemplateConfigSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },

    fonts: {
        heading: { type: FontConfigSchema, required: true },
        body: { type: FontConfigSchema, required: true },
        label: { type: FontConfigSchema, required: true }
    },

    colors: { type: ColorPaletteSchema, required: true },

    layout: {
        pageSize: { type: String, enum: ['A4', 'Letter'], required: true },
        pageMargin: { type: Number, required: true },
        contentMaxWidth: { type: Number, required: true },
        sectionGap: { type: Number, required: true },
        alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
    },

    header: {
        enabled: { type: Boolean, required: true },
        layout: { type: String, enum: ['logo-left', 'logo-center', 'logo-right', 'split'], required: true },
        backgroundColor: { type: String },
        padding: { type: Number, required: true },
        borderBottom: { type: BorderConfigSchema },

        logo: {
            enabled: { type: Boolean, required: true },
            position: { type: String, enum: ['top-left', 'top-center', 'top-right'], required: true },
            maxWidth: { type: Number, required: true },
            maxHeight: { type: Number, required: true }
        },

        companyInfo: {
            position: { type: String, enum: ['left', 'center', 'right'], required: true },
            alignment: { type: String, enum: ['left', 'center', 'right'], required: true },
            showAddress: { type: Boolean, required: true },
            showContact: { type: Boolean, required: true },
            fontSize: { type: Number, required: true }
        },

        invoiceMeta: {
            position: { type: String, enum: ['left', 'right'], required: true },
            alignment: { type: String, enum: ['left', 'right'], required: true },
            showNumber: { type: Boolean, required: true },
            showDate: { type: Boolean, required: true },
            showDueDate: { type: Boolean, required: true },
            labelStyle: { type: String, enum: ['bold', 'muted', 'uppercase'], required: true }
        }
    },

    recipient: {
        enabled: { type: Boolean, required: true },
        layout: { type: String, enum: ['single-column', 'two-column'], required: true },
        labelStyle: { type: String, enum: ['bold', 'pill', 'uppercase'], required: true },
        showShipTo: { type: Boolean, required: true },
        fontSize: { type: Number, required: true },
        gap: { type: Number, required: true }
    },

    table: {
        style: { type: String, enum: ['classic', 'modern', 'minimal', 'striped', 'bordered'], required: true },
        borderStyle: { type: String, enum: ['all', 'horizontal', 'none'], required: true },
        borderColor: { type: String, required: true },
        borderWidth: { type: Number, required: true },

        header: {
            backgroundColor: { type: String, required: true },
            textColor: { type: String, required: true },
            fontSize: { type: Number, required: true },
            fontWeight: { type: Number, required: true },
            textTransform: { type: String, enum: ['none', 'uppercase'], required: true },
            padding: { type: Number, required: true },
            alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
        },

        rows: {
            backgroundColor: { type: String, required: true },
            alternateRowBg: { type: String },
            textColor: { type: String, required: true },
            fontSize: { type: Number, required: true },
            padding: { type: Number, required: true },
            hoverEffect: { type: Boolean, required: true }
        },

        columns: {
            description: {
                width: { type: String, required: true },
                alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
            },
            quantity: {
                width: { type: String, required: true },
                alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
            },
            rate: {
                width: { type: String, required: true },
                alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
            },
            amount: {
                width: { type: String, required: true },
                alignment: { type: String, enum: ['left', 'center', 'right'], required: true }
            }
        },

        totals: {
            position: { type: String, enum: ['right', 'full-width'], required: true },
            backgroundColor: { type: String },
            labelWeight: { type: Number, required: true },
            valueWeight: { type: Number, required: true },
            highlightTotal: { type: Boolean, required: true },
            totalFontSize: { type: Number, required: true }
        }
    },

    notes: {
        enabled: { type: Boolean, required: true },
        position: { type: String, enum: ['before-footer', 'in-footer'], required: true },
        fontSize: { type: Number, required: true },
        color: { type: String, required: true },
        backgroundColor: { type: String },
        padding: { type: Number, required: true }
    },

    footer: {
        enabled: { type: Boolean, required: true },
        layout: { type: String, enum: ['single-column', 'two-column', 'centered'], required: true },
        backgroundColor: { type: String },
        borderTop: { type: BorderConfigSchema },
        padding: { type: Number, required: true },

        paymentInfo: {
            enabled: { type: Boolean, required: true },
            position: { type: String, enum: ['left', 'center', 'right'], required: true },
            showBankDetails: { type: Boolean, required: true },
            fontSize: { type: Number, required: true }
        },

        thankYou: {
            enabled: { type: Boolean, required: true },
            text: { type: String, required: true },
            fontSize: { type: Number, required: true },
            fontWeight: { type: Number, required: true },
            color: { type: String, required: true }
        }
    }
}, { _id: false });

const InvoiceTemplateSchema = new Schema<IInvoiceTemplate>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ['preset', 'custom'],
            required: true,
            index: true
        },

        isDefault: {
            type: Boolean,
            default: false,
            index: true
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },

        isPublic: {
            type: Boolean,
            default: false,
            index: true
        },

        config: {
            type: TemplateConfigSchema,
            required: true
        },

        usageCount: {
            type: Number,
            default: 0
        },

        lastUsedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        collection: 'invoicetemplates'
    }
);

// Indexes for efficient queries
InvoiceTemplateSchema.index({ tenantId: 1, type: 1 });
InvoiceTemplateSchema.index({ tenantId: 1, isDefault: 1 });
InvoiceTemplateSchema.index({ type: 1, isPublic: 1 });

// Ensure only one default template per tenant
InvoiceTemplateSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await mongoose.model('InvoiceTemplate').updateMany(
            {
                tenantId: this.tenantId,
                _id: { $ne: this._id },
                type: 'custom'
            },
            { isDefault: false }
        );
    }
    next();
});

export const InvoiceTemplate = mongoose.model<IInvoiceTemplate>('InvoiceTemplate', InvoiceTemplateSchema);
