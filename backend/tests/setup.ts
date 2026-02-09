import request from 'supertest';
import { app } from '../src/server';
import { connectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { Tenant } from '../src/models/Tenant';
import { Vendor } from '../src/models/Vendor';
import { Invoice } from '../src/models/Invoice';
import { Payment } from '../src/models/Payment';
import mongoose from 'mongoose';

/**
 * Global test setup and teardown
 */

let testDbConnection: typeof mongoose;

beforeAll(async () => {
    // Connect to test database
    process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/invoice-saas-test';
    testDbConnection = await connectDatabase();
    console.log('✓ Test database connected');
});

afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Vendor.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});

    await mongoose.connection.close();
    console.log('✓ Test database disconnected');
});

beforeEach(async () => {
    // Clear collections before each test for isolation
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Vendor.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
});

/**
 * Test helper functions
 */

export const testHelpers = {
    /**
     * Create test tenant and owner user
     */
    async createTenantAndUser(data?: {
        companyName?: string;
        email?: string;
        password?: string;
        tier?: 'free' | 'pro' | 'enterprise';
    }) {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                companyName: data?.companyName || 'Test Company',
                firstName: 'Test',
                lastName: 'User',
                email: data?.email || 'test@example.com',
                password: data?.password || 'Test1234!',
            });

        return {
            tenant: response.body.data.tenant,
            user: response.body.data.user,
            accessToken: response.body.data.accessToken,
            refreshToken: response.body.data.refreshToken,
        };
    },

    /**
     * Create authenticated request headers
     */
    authHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        };
    },

    /**
     * Create test vendor
     */
    async createVendor(token: string, data?: Partial<any>) {
        const response = await request(app)
            .post('/api/vendors')
            .set(testHelpers.authHeaders(token))
            .send({
                companyName: data?.companyName || 'Test Vendor',
                contactPerson: data?.contactPerson || 'John Doe',
                email: data?.email || 'vendor@example.com',
                phone: data?.phone || '+1-555-1234',
                address: data?.address || {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001',
                    country: 'USA',
                },
                ...data,
            });

        return response.body.data;
    },

    /**
     * Create test invoice
     */
    async createInvoice(token: string, vendorId: string, data?: Partial<any>) {
        const response = await request(app)
            .post('/api/invoices')
            .set(testHelpers.authHeaders(token))
            .send({
                vendorId,
                items: data?.items || [
                    {
                        description: 'Web Development',
                        quantity: 20,
                        rate: 150,
                        amount: 3000,
                    },
                ],
                taxRate: data?.taxRate || 10,
                issueDate: data?.issueDate || new Date(),
                dueDate: data?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ...data,
            });

        return response.body.data;
    },

    /**
     * Create test payment
     */
    async createPayment(token: string, invoiceId: string, amount: number) {
        const response = await request(app)
            .post(`/api/invoices/${invoiceId}/payments`)
            .set(testHelpers.authHeaders(token))
            .send({
                amount,
                paymentMethod: 'bank_transfer',
                paymentDate: new Date(),
            });

        return response.body.data;
    },

    /**
     * Wait for async operations
     */
    async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
};

export default testHelpers;
