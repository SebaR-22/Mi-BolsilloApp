const request = require('supertest');
const express = require('express');
const { chat } = require('../../src/controllers/chatController');
const { getChatResponse } = require('../../src/services/geminiService');

jest.mock('../../src/services/geminiService');

describe('Chat Controller', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        
        app = express();
        app.use(express.json());
        app.post('/api/chat', chat);
    });

    test('should return 400 when message is missing', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Message is required');
    });

    test('should return 400 when message is empty', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: '' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Message is required');
    });

    test('should return chat response successfully', async () => {
        const mockResponse = 'This is a test response';
        getChatResponse.mockResolvedValue(mockResponse);

        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Hello, how are you?' });

        expect(res.status).toBe(200);
        expect(res.body.response).toBe(mockResponse);
        expect(getChatResponse).toHaveBeenCalledWith('Hello, how are you?');
    });

    test('should handle service errors', async () => {
        const mockError = new Error('Service Error');
        getChatResponse.mockRejectedValue(mockError);

        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Test message' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error processing chat');
        expect(res.body.error).toBe('Service Error');
    });

    test('should handle special characters in message', async () => {
        const mockResponse = 'Response with special chars';
        getChatResponse.mockResolvedValue(mockResponse);

        const res = await request(app)
            .post('/api/chat')
            .send({ message: '¿Cómo estás? 😊' });

        expect(res.status).toBe(200);
        expect(res.body.response).toBe(mockResponse);
        expect(getChatResponse).toHaveBeenCalledWith('¿Cómo estás? 😊');
    });

    test('should handle very long messages', async () => {
        const mockResponse = 'Response for long message';
        getChatResponse.mockResolvedValue(mockResponse);
        
        const longMessage = 'a'.repeat(5000);

        const res = await request(app)
            .post('/api/chat')
            .send({ message: longMessage });

        expect(res.status).toBe(200);
        expect(res.body.response).toBe(mockResponse);
    });
});
