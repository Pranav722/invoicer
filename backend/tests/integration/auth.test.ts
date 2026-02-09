import request from 'supertest';
import { app } from '../../src/server';
import { testHelpers } from '../setup';

/**
 * TC-AUTH-001 to TC-AUTH-005: Authentication & Authorization Tests
 */

describe('Authentication API', () => {
    describe('POST /api/auth/register - TC-AUTH-001', () => {
        it('should register new tenant with owner user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    companyName: 'Acme Corporation',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@acme.com',
                    password: 'SecurePass123!',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('tenant');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');

            // Verify tenant data
            expect(response.body.data.tenant.companyName).toBe('Acme Corporation');

            // Verify user data
            expect(response.body.data.user.email).toBe('john@acme.com');
            expect(response.body.data.user.role).toBe('owner');
            expect(response.body.data.user).not.toHaveProperty('password'); // Password should not be returned
        });

        it('should reject registration with existing email', async () => {
            // Create first user
            await testHelpers.createTenantAndUser({ email: 'existing@example.com' });

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    companyName: 'Another Company',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'existing@example.com',
                    password: 'Password123!',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject weak passwords', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    companyName: 'Test Company',
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: '123', // Too weak
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login - TC-AUTH-002', () => {
        it('should login with valid credentials', async () => {
            // Create user
            await testHelpers.createTenantAndUser({
                email: 'login@example.com',
                password: 'ValidPass123!',
            });

            // Login
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'ValidPass123!',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user.email).toBe('login@example.com');
        });

        it('should reject invalid credentials', async () => {
            await testHelpers.createTenantAndUser({
                email: 'user@example.com',
                password: 'CorrectPass123!',
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'WrongPassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/invalid/i);
        });

        it('should reject non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'SomePassword123!',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/refresh - TC-AUTH-004', () => {
        it('should refresh access token', async () => {
            const { refreshToken } = await testHelpers.createTenantAndUser();

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data.accessToken).not.toBe(refreshToken);
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me - Profile', () => {
        it('should get current user profile', async () => {
            const { accessToken, user } = await testHelpers.createTenantAndUser();

            const response = await request(app)
                .get('/api/auth/me')
                .set(testHelpers.authHeaders(accessToken));

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(user.email);
            expect(response.body.data.role).toBe('owner');
        });

        it('should reject unauthenticated request', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });
});
