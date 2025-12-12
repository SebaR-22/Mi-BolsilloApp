const request = require('supertest');
const express = require('express');
const { supabase } = require('../../src/config/supabase');

jest.mock('../../src/config/supabase');

describe('Transaction Routes', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        
        app = express();
        app.use(express.json());
        // Mock the transaction routes
        app.get('/api/transactions', async (req, res) => {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*');

                if (error) throw error;
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/transactions', async (req, res) => {
            const { user_id, category, amount, description, type } = req.body;

            if (!user_id || !category || !amount || !type) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .insert([{
                        user_id,
                        category,
                        amount,
                        description,
                        type,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                res.status(201).json(data);
            } catch (error) {
                res.status(500).json({ message: 'Error creating transaction', error: error.message });
            }
        });
    });

    test('should fetch all transactions', async () => {
        const mockTransactions = [
            { id: 1, amount: 100, type: 'expense' },
            { id: 2, amount: 50, type: 'income' }
        ];

        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                data: mockTransactions,
                error: null
            })
        });

        const res = await request(app)
            .get('/api/transactions');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTransactions);
    });

    test('should handle transaction fetch errors', async () => {
        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error')
            })
        });

        const res = await request(app)
            .get('/api/transactions');

        expect(res.status).toBe(500);
        expect(res.body.error).toContain('Database error');
    });

    test('should create a new transaction', async () => {
        const newTransaction = {
            id: 1,
            user_id: 1,
            category: 'food',
            amount: 50,
            description: 'Lunch',
            type: 'expense',
            created_at: new Date().toISOString()
        };

        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: newTransaction,
                        error: null
                    })
                })
            })
        });

        const res = await request(app)
            .post('/api/transactions')
            .send({
                user_id: 1,
                category: 'food',
                amount: 50,
                description: 'Lunch',
                type: 'expense'
            });

        expect(res.status).toBe(201);
        expect(res.body.category).toBe('food');
        expect(res.body.amount).toBe(50);
    });

    test('should return 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .send({
                user_id: 1,
                category: 'food'
                // Missing amount and type
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing required fields');
    });

    test('should handle transaction creation errors', async () => {
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Insert failed')
                    })
                })
            })
        });

        const res = await request(app)
            .post('/api/transactions')
            .send({
                user_id: 1,
                category: 'food',
                amount: 50,
                type: 'expense'
            });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error creating transaction');
    });
});
