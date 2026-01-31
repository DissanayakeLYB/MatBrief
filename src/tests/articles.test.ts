/**
 * Article Service Tests
 * 
 * Tests the article service by mocking Supabase responses.
 * 
 * Test Categories:
 * 1. Successful fetch — Returns articles in correct format
 * 2. Empty state — Returns empty array (not error)
 * 3. Error handling — Network, permission, and unknown errors
 * 4. Data transformation — snake_case to camelCase
 */

import { fetchArticles } from '../services/articles';
import { supabase } from '../services/supabase';

// Type the mocked supabase
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock the chainable query builder
const mockSelect = jest.fn();
const mockOrder = jest.fn();

// Set up the mock chain: from().select().order()
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset the chain
  mockOrder.mockReturnValue({ data: [], error: null });
  mockSelect.mockReturnValue({ order: mockOrder });
  (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
});

/**
 * Helper to create mock article data as it comes from Supabase (snake_case).
 */
const createMockDbArticle = (overrides = {}) => ({
  id: 'article-123',
  title: 'Test Article',
  summary: 'This is a test article summary.',
  tags: ['test', 'example'],
  external_url: 'https://example.com/article',
  created_at: '2024-01-15T10:30:00.000Z',
  ...overrides,
});

describe('fetchArticles', () => {
  describe('Successful Fetch', () => {
    it('returns articles when data exists', async () => {
      const mockArticles = [
        createMockDbArticle({ id: '1', title: 'Article 1' }),
        createMockDbArticle({ id: '2', title: 'Article 2' }),
      ];
      
      mockOrder.mockReturnValue({ data: mockArticles, error: null });

      const result = await fetchArticles();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].title).toBe('Article 1');
      expect(result.data?.[1].title).toBe('Article 2');
    });

    it('queries the articles table', async () => {
      mockOrder.mockReturnValue({ data: [], error: null });

      await fetchArticles();

      expect(mockSupabase.from).toHaveBeenCalledWith('articles');
    });

    it('selects the correct columns', async () => {
      mockOrder.mockReturnValue({ data: [], error: null });

      await fetchArticles();

      expect(mockSelect).toHaveBeenCalledWith(
        'id, title, summary, tags, external_url, created_at'
      );
    });

    it('orders by created_at descending', async () => {
      mockOrder.mockReturnValue({ data: [], error: null });

      await fetchArticles();

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('Data Transformation', () => {
    it('transforms snake_case to camelCase', async () => {
      const dbArticle = createMockDbArticle({
        external_url: 'https://example.com/test',
        created_at: '2024-06-01T12:00:00.000Z',
      });
      
      mockOrder.mockReturnValue({ data: [dbArticle], error: null });

      const result = await fetchArticles();

      expect(result.data?.[0]).toEqual({
        id: 'article-123',
        title: 'Test Article',
        summary: 'This is a test article summary.',
        tags: ['test', 'example'],
        externalUrl: 'https://example.com/test',  // camelCase
        createdAt: '2024-06-01T12:00:00.000Z',    // camelCase
      });
    });

    it('handles null tags as empty array', async () => {
      const dbArticle = createMockDbArticle({ tags: null });
      
      mockOrder.mockReturnValue({ data: [dbArticle], error: null });

      const result = await fetchArticles();

      expect(result.data?.[0].tags).toEqual([]);
    });

    it('preserves tags array when present', async () => {
      const dbArticle = createMockDbArticle({ tags: ['react', 'native', 'expo'] });
      
      mockOrder.mockReturnValue({ data: [dbArticle], error: null });

      const result = await fetchArticles();

      expect(result.data?.[0].tags).toEqual(['react', 'native', 'expo']);
    });
  });

  describe('Empty State', () => {
    it('returns empty array when no articles exist', async () => {
      mockOrder.mockReturnValue({ data: [], error: null });

      const result = await fetchArticles();

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('returns empty array when data is null', async () => {
      mockOrder.mockReturnValue({ data: null, error: null });

      const result = await fetchArticles();

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('returns network_error for connection failures', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Failed to fetch: network error' },
      });

      const result = await fetchArticles();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('network_error');
      expect(result.error?.message).toContain('internet connection');
    });

    it('returns permission_denied for RLS errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'permission denied for table articles', code: '42501' },
      });

      const result = await fetchArticles();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('permission_denied');
      expect(result.error?.message).toContain('permission');
    });

    it('returns permission_denied for PostgREST RLS errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security', code: 'PGRST301' },
      });

      const result = await fetchArticles();

      expect(result.error?.code).toBe('permission_denied');
    });

    it('returns unknown_error for unrecognized errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Something unexpected happened' },
      });

      const result = await fetchArticles();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('unknown_error');
      expect(result.error?.message).toBe('Unable to load articles. Please try again.');
    });

    it('handles timeout errors as network errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Request timeout after 30000ms' },
      });

      const result = await fetchArticles();

      expect(result.error?.code).toBe('network_error');
    });
  });
});
