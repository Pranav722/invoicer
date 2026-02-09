import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    tenantId: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;

    profile: {
        firstName: string;
        lastName: string;
        phone?: string;
        avatar?: string;
    };

    role: 'owner' | 'admin' | 'employee' | 'viewer';
    permissions: string[];

    // RBAC - Employee Vendor Assignment
    assignedVendors: mongoose.Types.ObjectId[];  // Vendors employee can access
    createdByAdmin: boolean;  // Employee created by admin (not self-registered)

    twoFactorEnabled: boolean;
    twoFactorSecret?: string;

    refreshTokens: Array<{
        token: string;
        createdAt: Date;
        expiresAt: Date;
        deviceInfo?: string;
    }>;

    lastLogin?: Date;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        email: { type: String, required: true, lowercase: true },
        passwordHash: { type: String, required: true },

        profile: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: String,
            avatar: String
        },

        role: {
            type: String,
            enum: ['owner', 'admin', 'employee', 'viewer'],
            default: 'employee'
        },
        permissions: [{ type: String }],

        // RBAC - Employee Vendor Assignment
        assignedVendors: [{
            type: Schema.Types.ObjectId,
            ref: 'Vendor'
        }],
        createdByAdmin: { type: Boolean, default: false },  // Admin-created employees

        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: String,

        refreshTokens: [{
            token: String,
            createdAt: Date,
            expiresAt: Date,
            deviceInfo: String
        }],

        lastLogin: Date,
        isActive: { type: Boolean, default: true },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

// Compound unique index for email within tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, isActive: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash as string, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
