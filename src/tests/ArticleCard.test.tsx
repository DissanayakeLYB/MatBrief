/**
 * ArticleCard Component Tests
 * 
 * Tests the ArticleCard UI component.
 * 
 * Test Categories:
 * 1. Snapshot — Visual regression testing
 * 2. Rendering — Content displays correctly
 * 3. Interaction — Press handler works
 * 4. Edge cases — Empty tags, long text, many tags
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import { ArticleCard } from '../components/ArticleCard';

// Default test props
const defaultProps = {
  title: 'Test Article Title',
  summary: 'This is a test summary for the article card component.',
  tags: ['react', 'testing'],
  onPress: jest.fn(),
};

describe('ArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('matches snapshot with all props', () => {
      const { toJSON } = render(<ArticleCard {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with no tags', () => {
      const { toJSON } = render(
        <ArticleCard {...defaultProps} tags={[]} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with many tags (shows +N)', () => {
      const { toJSON } = render(
        <ArticleCard
          {...defaultProps}
          tags={['react', 'native', 'typescript', 'expo', 'jest']}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Rendering', () => {
    it('displays the title', () => {
      render(<ArticleCard {...defaultProps} />);

      expect(screen.getByTestId('article-title')).toBeTruthy();
      expect(screen.getByText('Test Article Title')).toBeTruthy();
    });

    it('displays the summary', () => {
      render(<ArticleCard {...defaultProps} />);

      expect(screen.getByTestId('article-summary')).toBeTruthy();
      expect(screen.getByText(defaultProps.summary)).toBeTruthy();
    });

    it('displays tags', () => {
      render(<ArticleCard {...defaultProps} />);

      expect(screen.getByTestId('article-tags')).toBeTruthy();
      expect(screen.getByText('react')).toBeTruthy();
      expect(screen.getByText('testing')).toBeTruthy();
    });

    it('hides tags container when tags array is empty', () => {
      render(<ArticleCard {...defaultProps} tags={[]} />);

      expect(screen.queryByTestId('article-tags')).toBeNull();
    });

    it('limits displayed tags to 3 and shows count for more', () => {
      render(
        <ArticleCard
          {...defaultProps}
          tags={['one', 'two', 'three', 'four', 'five']}
        />
      );

      // First 3 should be visible
      expect(screen.getByText('one')).toBeTruthy();
      expect(screen.getByText('two')).toBeTruthy();
      expect(screen.getByText('three')).toBeTruthy();

      // 4th and 5th should NOT be visible as individual tags
      expect(screen.queryByText('four')).toBeNull();
      expect(screen.queryByText('five')).toBeNull();

      // Should show "+2" indicator
      expect(screen.getByText('+2')).toBeTruthy();
    });

    it('does not show +N when exactly 3 tags', () => {
      render(
        <ArticleCard
          {...defaultProps}
          tags={['one', 'two', 'three']}
        />
      );

      expect(screen.getByText('one')).toBeTruthy();
      expect(screen.getByText('two')).toBeTruthy();
      expect(screen.getByText('three')).toBeTruthy();
      expect(screen.queryByText(/^\+/)).toBeNull();
    });
  });

  describe('Interaction', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      render(<ArticleCard {...defaultProps} onPress={onPress} />);

      fireEvent.press(screen.getByTestId('article-card'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress multiple times on single press', () => {
      const onPress = jest.fn();
      render(<ArticleCard {...defaultProps} onPress={onPress} />);

      fireEvent.press(screen.getByTestId('article-card'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      render(<ArticleCard {...defaultProps} />);

      const card = screen.getByTestId('article-card');
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('has accessibility label with title', () => {
      render(<ArticleCard {...defaultProps} />);

      const card = screen.getByTestId('article-card');
      expect(card.props.accessibilityLabel).toBe('Article: Test Article Title');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long title with truncation', () => {
      const longTitle = 'This is a very long article title that should be truncated because it exceeds the maximum number of lines allowed';
      render(<ArticleCard {...defaultProps} title={longTitle} />);

      const titleElement = screen.getByTestId('article-title');
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    it('handles very long summary with truncation', () => {
      const longSummary = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';
      render(<ArticleCard {...defaultProps} summary={longSummary} />);

      const summaryElement = screen.getByTestId('article-summary');
      expect(summaryElement.props.numberOfLines).toBe(3);
    });

    it('handles single tag', () => {
      render(<ArticleCard {...defaultProps} tags={['solo']} />);

      expect(screen.getByText('solo')).toBeTruthy();
      expect(screen.queryByText(/^\+/)).toBeNull();
    });

    it('handles special characters in tags', () => {
      render(<ArticleCard {...defaultProps} tags={['c++', 'c#', 'node.js']} />);

      expect(screen.getByText('c++')).toBeTruthy();
      expect(screen.getByText('c#')).toBeTruthy();
      expect(screen.getByText('node.js')).toBeTruthy();
    });
  });
});
