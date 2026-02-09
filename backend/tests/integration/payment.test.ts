import request from 'supertest';
import { app } from '../../src/server';
import { testHelpers } from '../setup';

/**
 * TC-PAYMENT-001 to TC-PAYMENT-004: Payment Tracking Tests
 */

describe('Payment API', () => {
    let authToken: string;
    let vendorId: string;
    let invoiceId: string;

    beforeEach(async () => {
        // Setup
        const { accessToken } = await testHelpers.createTenantAndUser();
        authToken = accessToken;

        const vendor = await testHelpers.createVendor(authToken);
        vendorId = vendor._id;

        // Create invoice with $1000 total
        const invoice = await testHelpers.createInvoice(authToken, vendorId, {
            items: [{ description: 'Service', quantity: 10, rate: 100, amount: 1000 }],
            taxRate: 0,
        });
        invoiceId = invoice._id;
    });

    describe('POST /api/invoices/:id/payments - TC-PAYMENT-001', () => {
        it('should record partial payment and update invoice', async () => {
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 400,
                    paymentMethod: 'bank_transfer',
                    paymentDate: new Date(),
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            const payment = response.body.data;
            expect(payment.amount).toBe(400);
            expect(payment.paymentMethod).toBe('bank_transfer');

            // Verify invoice updated
            const invoiceResponse = await request(app)
                .get(`/api/invoices/${invoiceId}`)
                .set(testHelpers.authHeaders(authToken));

            const invoice = invoiceResponse.body.data;
            expect(invoice.amountPaid).toBe(400);
            expect(invoice.amountDue).toBe(600); // 1000 - 400
            expect(invoice.status).toBe('draft'); // Not fully paid yet
        });

        it('should mark invoice as paid when fully paid', async () => {
            // First payment: $400
            await testHelpers.createPayment(authToken, invoiceId, 400);

            // Second payment: $600 (total $1000)
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 600,
                    paymentMethod: 'credit_card',
                    paymentDate: new Date(),
                });

            expect(response.status).toBe(201);

            // Verify invoice marked as paid
            const invoiceResponse = await request(app)
                .get(`/api/invoices/${invoiceId}`)
                .set(testHelpers.authHeaders(authToken));

            const invoice = invoiceResponse.body.data;
            expect(invoice.amountPaid).toBe(1000);
            expect(invoice.amountDue).toBe(0);
            expect(invoice.status).toBe('paid');
        });
    });

    describe('Overpayment Validation - TC-PAYMENT-002', () => {
        it('should reject overpayment', async () => {
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 1500, // Invoice total is $1000
                    paymentMethod: 'bank_transfer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/exceeds/i);
        });

        it('should reject overpayment on partially paid invoice', async () => {
            // Pay $400 first
            await testHelpers.createPayment(authToken, invoiceId, 400);

            // Try to pay $800 (total would be $1200)
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 800,
                    paymentMethod: 'bank_transfer',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/invoices/:id/payments - TC-PAYMENT-003', () => {
        it('should list payment history', async () => {
            // Create multiple payments
            await testHelpers.createPayment(authToken, invoiceId, 200);
            await testHelpers.createPayment(authToken, invoiceId, 300);
            await testHelpers.createPayment(authToken, invoiceId, 500);

            const response = await request(app)
                .get(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken));

            expect(response.status).toBe(200);
            expect(response.body.data.payments).toHaveLength(3);
            expect(response.body.data.payments[0].amount).toBe(500); // Newest first
            expect(response.body.data.payments[1].amount).toBe(300);
            expect(response.body.data.payments[2].amount).toBe(200);
        });
    });

    describe('DELETE /api/payments/:id - TC-PAYMENT-004', () => {
        it('should delete payment and update invoice amounts', async () => {
            // Create two payments
            const payment1 = await testHelpers.createPayment(authToken, invoiceId, 500);
            const payment2 = await testHelpers.createPayment(authToken, invoiceId, 500);

            // Invoice should be fully paid now
            let invoiceCheck = await request(app)
                .get(`/api/invoices/${invoiceId}`)
                .set(testHelpers.authHeaders(authToken));
            expect(invoiceCheck.body.data.status).toBe('paid');

            // Delete one payment
            const response = await request(app)
                .delete(`/api/payments/${payment2._id}`)
                .set(testHelpers.authHeaders(authToken));

            expect(response.status).toBe(200);

            // Verify invoice updated
            const invoiceResponse = await request(app)
                .get(`/api/invoices/${invoiceId}`)
                .set(testHelpers.authHeaders(authToken));

            const invoice = invoiceResponse.body.data;
            expect(invoice.amountPaid).toBe(500); // Only first payment remains
            expect(invoice.amountDue).toBe(500);
            expect(invoice.status).not.toBe('paid'); // No longer fully paid
        });
    });

    describe('Payment Validation', () => {
        it('should reject negative payment amount', async () => {
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: -100,
                    paymentMethod: 'bank_transfer',
                });

            expect(response.status).toBe(400);
        });

        it('should reject zero payment amount', async () => {
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 0,
                    paymentMethod: 'bank_transfer',
                });

            expect(response.status).toBe(400);
        });

        it('should require payment method', async () => {
            const response = await request(app)
                .post(`/api/invoices/${invoiceId}/payments`)
                .set(testHelpers.authHeaders(authToken))
                .send({
                    amount: 100,
                });

            expect(response.status).toBe(400);
        });
    });
});
