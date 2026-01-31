/**
 * ArticleScreen Tests
 * 
 * Tests the Article detail screen with mocked services and Linking API.
 * 
 * Test Categories:
 * 1. Loading state — Shows spinner while fetching
 * 2. Success state — Displays article content
 * 3. Error state — Shows error with retry
 * 4. Navigation — Back button works
 * 5. External link — Opens URL with Linking API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import { ArticleScreen } from '../screens/ArticleScreen';
import * as articlesService from '../services/articles';

// Mock the articles service
jest.mock('../services/articles');
const mockFetchArticleById = articlesService.fetchArticleById as jest.MockedFunction<
  typeof articlesService.fetchArticleById
>;

// Mock Linking API
jest.spyOn(Linking, 'canOpenURL');
jest.spyOn(Linking, 'openURL');

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: jest.fn(),
  goBack: mockGoBack,
  reset: jest.fn(),
  setOptions: jest.fn(),
} as any;

// Mock route with articleId
const mockRoute = {
  params: { articleId: 'test-article-123' },
} as any;

// Sample article data
const mockArticle = {
  id: 'test-article-123',
  title: 'Test Article Title',
  summary: 'This is a detailed summary of the test article. It contains important information about the topic being discussed.',
  tags: ['react', 'native', 'testing'],
  externalUrl: 'https://example.com/full-article',
  createdAt: '2024-06-15T10:30:00.000Z',
};

describe('ArticleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching article', async () => {
      let resolveFetch: (value: any) => void;
      mockFetchArticleById.mockImplementation(
        () => new Promise((resolve) => { resolveFetch = resolve; })
      );

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      expect(screen.getByTestId('loading-indicator')).toBeTruthy();

      // Clean up
      resolveFetch!({ data: mockArticle, error: null });
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockFetchArticleById.mockResolvedValue({ data: mockArticle, error: null });
    });

    it('displays article title', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('article-title')).toBeTruthy();
        expect(screen.getByText('Test Article Title')).toBeTruthy();
      });
    });

    it('displays article summary', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('article-summary')).toBeTruthy();
        expect(screen.getByText(mockArticle.summary)).toBeTruthy();
      });
    });

    it('displays article tags', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('article-tags')).toBeTruthy();
        expect(screen.getByText('react')).toBeTruthy();
        expect(screen.getByText('native')).toBeTruthy();
        expect(screen.getByText('testing')).toBeTruthy();
      });
    });

    it('displays formatted date', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('article-date')).toBeTruthy();
        // Date format: "June 15, 2024"
        expect(screen.getByText(/June 15, 2024/)).toBeTruthy();
      });
    });

    it('displays Read Full Article button', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('read-full-article-button')).toBeTruthy();
        expect(screen.getByText('Read Full Article')).toBeTruthy();
      });
    });

    it('fetches article with correct ID', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(mockFetchArticleById).toHaveBeenCalledWith('test-article-123');
      });
    });

    it('hides tags section when article has no tags', async () => {
      mockFetchArticleById.mockResolvedValue({
        data: { ...mockArticle, tags: [] },
        error: null,
      });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('article-content')).toBeTruthy();
      });

      expect(screen.queryByTestId('article-tags')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('shows error state when fetch fails', async () => {
      mockFetchArticleById.mockResolvedValue({
        data: null,
        error: { code: 'network_error', message: 'Network error occurred' },
      });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
        expect(screen.getByText('Unable to load article')).toBeTruthy();
        expect(screen.getByText('Network error occurred')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockFetchArticleById.mockResolvedValue({
        data: null,
        error: { code: 'not_found', message: 'Article not found.' },
      });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeTruthy();
      });
    });

    it('retries fetch when retry button is pressed', async () => {
      // First call fails
      mockFetchArticleById.mockResolvedValueOnce({
        data: null,
        error: { code: 'network_error', message: 'Error' },
      });
      // Second call succeeds
      mockFetchArticleById.mockResolvedValueOnce({
        data: mockArticle,
        error: null,
      });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeTruthy();
      });

      expect(mockFetchArticleById).toHaveBeenCalledTimes(2);
    });
  });

  describe('Navigation', () => {
    it('calls goBack when back button is pressed', async () => {
      mockFetchArticleById.mockResolvedValue({ data: mockArticle, error: null });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('back-button'));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('shows back button with correct text', async () => {
      mockFetchArticleById.mockResolvedValue({ data: mockArticle, error: null });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      expect(screen.getByText('← Back')).toBeTruthy();
    });
  });

  describe('External Link (Linking API)', () => {
    beforeEach(() => {
      mockFetchArticleById.mockResolvedValue({ data: mockArticle, error: null });
    });

    it('checks if URL can be opened when button is pressed', async () => {
      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('read-full-article-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('read-full-article-button'));

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com/full-article');
      });
    });

    it('opens URL when canOpenURL returns true', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('read-full-article-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('read-full-article-button'));

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/full-article');
      });
    });

    it('shows alert when URL cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('read-full-article-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('read-full-article-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unable to Open',
          'Cannot open this link. The URL may be invalid.',
          [{ text: 'OK' }]
        );
      });

      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('shows alert when openURL throws an error', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed'));

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('read-full-article-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('read-full-article-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to open the article link.',
          [{ text: 'OK' }]
        );
      });
    });
  });

  describe('Network Error Handling', () => {
    it('shows network error when fetchArticleById throws', async () => {
      // Simulate a network failure by rejecting the promise
      mockFetchArticleById.mockRejectedValue(new Error('Network request failed'));

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
        expect(screen.getByText('Unable to connect. Please check your internet connection.')).toBeTruthy();
      });
    });

    it('allows retry after network error from thrown exception', async () => {
      // First call throws
      mockFetchArticleById.mockRejectedValueOnce(new Error('Network request failed'));
      // Second call succeeds
      mockFetchArticleById.mockResolvedValueOnce({
        data: mockArticle,
        error: null,
      });

      render(<ArticleScreen navigation={mockNavigation} route={mockRoute} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeTruthy();
      });

      // Press retry
      fireEvent.press(screen.getByText('Try Again'));

      // Should show article now
      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeTruthy();
        expect(screen.queryByTestId('error-state')).toBeNull();
      });
    });
  });
});
