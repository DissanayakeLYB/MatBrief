/**
 * FeedScreen Integration Tests
 * 
 * Tests the Feed screen with mocked article service.
 * 
 * Test Categories:
 * 1. Loading state — Shows spinner while fetching
 * 2. Success state — Displays articles in list
 * 3. Empty state — Shows message when no articles
 * 4. Error state — Shows error with retry button
 * 5. Interaction — Article press, sign out, refresh
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { FeedScreen } from '../screens/FeedScreen';
import * as articlesService from '../services/articles';
import * as authService from '../services/auth';

// Mock the services
jest.mock('../services/articles');
jest.mock('../services/auth');

const mockFetchArticles = articlesService.fetchArticles as jest.MockedFunction<
  typeof articlesService.fetchArticles
>;
const mockSignOut = authService.signOut as jest.MockedFunction<
  typeof authService.signOut
>;

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
} as any;

// Sample article data
const mockArticles = [
  {
    id: '1',
    title: 'First Article',
    summary: 'Summary of the first article',
    tags: ['react', 'native'],
    externalUrl: 'https://example.com/1',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Second Article',
    summary: 'Summary of the second article',
    tags: ['typescript'],
    externalUrl: 'https://example.com/2',
    createdAt: '2024-01-14T10:00:00Z',
  },
];

describe('FeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue({ data: null, error: null });
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching articles', async () => {
      // Make fetchArticles hang to test loading state
      let resolveFetch: (value: any) => void;
      mockFetchArticles.mockImplementation(
        () => new Promise((resolve) => { resolveFetch = resolve; })
      );

      render(<FeedScreen navigation={mockNavigation} />);

      // Loading indicator should be visible
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.getByText('Loading articles...')).toBeTruthy();

      // Resolve to clean up
      resolveFetch!({ data: [], error: null });
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
      });
    });

    it('hides loading indicator after fetch completes', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
      });
    });
  });

  describe('Success State', () => {
    it('displays articles when fetch succeeds', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('First Article')).toBeTruthy();
        expect(screen.getByText('Second Article')).toBeTruthy();
      });
    });

    it('displays article summaries', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('Summary of the first article')).toBeTruthy();
        expect(screen.getByText('Summary of the second article')).toBeTruthy();
      });
    });

    it('displays article tags', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('react')).toBeTruthy();
        expect(screen.getByText('native')).toBeTruthy();
        expect(screen.getByText('typescript')).toBeTruthy();
      });
    });

    it('renders articles list', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByTestId('articles-list')).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no articles exist', async () => {
      mockFetchArticles.mockResolvedValue({ data: [], error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeTruthy();
        expect(screen.getByText('No articles yet')).toBeTruthy();
        expect(screen.getByText('Pull down to refresh or check back later.')).toBeTruthy();
      });
    });
  });

  describe('Error State', () => {
    it('shows error state when fetch fails', async () => {
      mockFetchArticles.mockResolvedValue({
        data: null,
        error: { code: 'network_error', message: 'Unable to connect' },
      });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
        expect(screen.getByText('Unable to load articles')).toBeTruthy();
        expect(screen.getByText('Unable to connect')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockFetchArticles.mockResolvedValue({
        data: null,
        error: { code: 'network_error', message: 'Network error' },
      });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeTruthy();
      });
    });

    it('retries fetch when retry button is pressed', async () => {
      // First call fails
      mockFetchArticles.mockResolvedValueOnce({
        data: null,
        error: { code: 'network_error', message: 'Network error' },
      });
      // Second call succeeds
      mockFetchArticles.mockResolvedValueOnce({
        data: mockArticles,
        error: null,
      });

      render(<FeedScreen navigation={mockNavigation} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
      });

      // Press retry
      fireEvent.press(screen.getByText('Try Again'));

      // Should show articles now
      await waitFor(() => {
        expect(screen.getByText('First Article')).toBeTruthy();
        expect(screen.queryByTestId('error-state')).toBeNull();
      });

      // fetchArticles should have been called twice
      expect(mockFetchArticles).toHaveBeenCalledTimes(2);
    });
  });

  describe('Article Interaction', () => {
    it('navigates to Article screen when card is pressed', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('First Article')).toBeTruthy();
      });

      // Find and press the first article card
      const articleCards = screen.getAllByTestId('article-card');
      fireEvent.press(articleCards[0]);

      expect(mockNavigate).toHaveBeenCalledWith('Article', { articleId: '1' });
    });

    it('passes correct articleId for each card', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByText('Second Article')).toBeTruthy();
      });

      // Press the second article
      const articleCards = screen.getAllByTestId('article-card');
      fireEvent.press(articleCards[1]);

      expect(mockNavigate).toHaveBeenCalledWith('Article', { articleId: '2' });
    });
  });

  describe('Sign Out', () => {
    it('calls signOut when sign out button is pressed', async () => {
      mockFetchArticles.mockResolvedValue({ data: mockArticles, error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByTestId('sign-out-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('sign-out-button'));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Header', () => {
    it('displays Feed title', async () => {
      mockFetchArticles.mockResolvedValue({ data: [], error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      expect(screen.getByText('Feed')).toBeTruthy();
    });

    it('displays sign out button', async () => {
      mockFetchArticles.mockResolvedValue({ data: [], error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      expect(screen.getByText('Sign Out')).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('fetches articles on mount', async () => {
      mockFetchArticles.mockResolvedValue({ data: [], error: null });

      render(<FeedScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(mockFetchArticles).toHaveBeenCalledTimes(1);
      });
    });
  });
});
