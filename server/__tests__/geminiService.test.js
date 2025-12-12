const { getChatResponse } = require('../../src/services/geminiService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

jest.mock('@google/generative-ai');

describe('Gemini Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.GEMINI_API_KEY;
        delete process.env.OPENAI_API_KEY;
    });

    test('should return mock response when no API key is configured', async () => {
        const message = 'Test message';
        const response = await getChatResponse(message);
        
        expect(response).toContain('Mock');
        expect(response).toContain(message);
    });

    test('should handle successful Gemini API response', async () => {
        process.env.GEMINI_API_KEY = 'test-key-12345';

        const mockResponse = {
            response: {
                candidates: [
                    {
                        finishReason: 'STOP',
                        content: {
                            parts: [{ text: 'Test response from Gemini' }]
                        }
                    }
                ]
            }
        };

        const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);
        const mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        const response = await getChatResponse('Test message');
        
        expect(response).toBe('Test response from Gemini');
        expect(mockGenerateContent).toHaveBeenCalledWith('Test message');
    });

    test('should handle SAFETY blocked responses', async () => {
        process.env.GEMINI_API_KEY = 'test-key-12345';

        const mockResponse = {
            response: {
                candidates: [
                    {
                        finishReason: 'SAFETY',
                        content: {
                            parts: []
                        }
                    }
                ]
            }
        };

        const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);
        const mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        const response = await getChatResponse('Unsafe message');
        
        expect(response).toContain('bloqueada por seguridad');
    });

    test('should handle API errors gracefully', async () => {
        process.env.GEMINI_API_KEY = 'test-key-12345';

        const mockGenerateContent = jest.fn().mockRejectedValue(
            new Error('API Error')
        );
        const mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        const response = await getChatResponse('Test message');
        
        expect(response).toContain('error');
        expect(response).toContain('API Error');
    });

    test('should handle empty response candidates', async () => {
        process.env.GEMINI_API_KEY = 'test-key-12345';

        const mockResponse = {
            response: {
                candidates: []
            }
        };

        const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);
        const mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        const response = await getChatResponse('Test message');
        
        expect(response).toContain('No se pudo generar');
    });
});
