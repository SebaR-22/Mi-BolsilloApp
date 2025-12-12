const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const { registerUser } = require('../../src/controllers/authController');
const { supabase } = require('../../src/config/supabase');

jest.mock('../../src/config/supabase');
jest.mock('bcrypt');

describe('Auth Controller', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        
        app = express();
        app.use(express.json());
        app.post('/api/auth/register', registerUser);
    });

    test('should return 400 if user already exists', async () => {
        const mockUser = { id: 1, email: 'test@test.com' };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: mockUser,
                    error: null
                })
            })
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    test('should register a new user successfully', async () => {
        const newUser = {
            id: 1,
            username: 'testuser',
            email: 'newuser@test.com',
            role: 'user'
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }),
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: newUser,
                        error: null
                    })
                })
            })
        });

        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword');

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'newuser@test.com',
                password: 'password123'
            });

        expect(res.status).toBe(201);
        expect(res.body.model.username).toBe('testuser');
        expect(res.body.model.email).toBe('newuser@test.com');
        expect(res.body.model.token).toBeDefined();
    });

    test('should handle missing username', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('should handle database errors', async () => {
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }),
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Database error')
                    })
                })
            })
        });

        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword');

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.status).toBe(500);
        expect(res.body.message).toContain('Server error');
    });

    test('should hash password correctly', async () => {
        const newUser = {
            id: 1,
            username: 'testuser',
            email: 'test@test.com',
            role: 'user'
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }),
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: newUser,
                        error: null
                    })
                })
            })
        });

        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword123');

        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            });

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    });
});
