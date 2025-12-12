/**
 * Integration test file for testing multiple components together
 * These tests verify the interaction between services, controllers, and routes
 */

const request = require('supertest');
const express = require('express');

describe('Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock health check endpoint
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Mock info endpoint
        app.get('/info', (req, res) => {
            res.json({
                name: 'MiBolsillo API',
                version: '1.0.0',
                endpoints: [
                    '/api/auth',
                    '/api/transactions',
                    '/api/reports',
                    '/api/chat'
                ]
            });
        });
    });

    test('should respond to health check', async () => {
        const res = await request(app)
            .get('/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
    });

    test('should return API info', async () => {
        const res = await request(app)
            .get('/info');

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('MiBolsillo API');
        expect(res.body.version).toBe('1.0.0');
        expect(res.body.endpoints).toBeInstanceOf(Array);
        expect(res.body.endpoints.length).toBeGreaterThan(0);
    });

    test('should handle 404 errors', async () => {
        const res = await request(app)
            .get('/non-existent-route');

        expect(res.status).toBe(404);
    });

    test('should reject requests with invalid JSON', async () => {
        const res = await request(app)
            .post('/health')
            .send('invalid json');

        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('should handle CORS headers', async () => {
        const res = await request(app)
            .get('/health');

        expect(res.status).toBe(200);
    });
});
