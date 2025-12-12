const { supabase } = require('../../src/config/supabase');

jest.mock('../../src/config/supabase');

describe('Supabase Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should export supabase client', () => {
        expect(supabase).toBeDefined();
    });

    test('should have from method', () => {
        expect(typeof supabase.from).toBe('function');
    });

    test('should create table reference', () => {
        const tableRef = supabase.from('users');
        expect(tableRef).toBeDefined();
    });

    test('should handle basic query operations', async () => {
        const mockData = [{ id: 1, name: 'Test' }];

        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                data: mockData,
                error: null
            })
        });

        const result = await supabase
            .from('test_table')
            .select('*');

        expect(result.data).toEqual(mockData);
        expect(result.error).toBeNull();
    });

    test('should handle query errors', async () => {
        const mockError = new Error('Query failed');

        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                data: null,
                error: mockError
            })
        });

        const result = await supabase
            .from('test_table')
            .select('*');

        expect(result.error).toEqual(mockError);
        expect(result.data).toBeNull();
    });
});
