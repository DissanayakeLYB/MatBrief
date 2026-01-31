/**
 * Reusable Components Tests
 * 
 * Tests for LoadingIndicator and ErrorDisplay components.
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import { LoadingIndicator, ErrorDisplay } from '../components';

describe('LoadingIndicator', () => {
  it('renders with default props', () => {
    render(<LoadingIndicator />);
    
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays message when provided', () => {
    render(<LoadingIndicator message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });

  it('does not display message when not provided', () => {
    render(<LoadingIndicator />);
    
    expect(screen.queryByText('Loading')).toBeNull();
  });

  it('uses custom testID when provided', () => {
    render(<LoadingIndicator testID="custom-loader" />);
    
    expect(screen.getByTestId('custom-loader')).toBeTruthy();
  });
});

describe('ErrorDisplay', () => {
  it('renders with default title', () => {
    render(<ErrorDisplay message="An error occurred" />);
    
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('An error occurred')).toBeTruthy();
  });

  it('renders with custom title', () => {
    render(<ErrorDisplay title="Network Error" message="No internet" />);
    
    expect(screen.getByText('Network Error')).toBeTruthy();
    expect(screen.getByText('No internet')).toBeTruthy();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);
    
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('hides retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Error" />);
    
    expect(screen.queryByText('Try Again')).toBeNull();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);
    
    fireEvent.press(screen.getByText('Try Again'));
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('uses custom retry text', () => {
    render(<ErrorDisplay message="Error" onRetry={() => {}} retryText="Reload" />);
    
    expect(screen.getByText('Reload')).toBeTruthy();
  });

  it('uses custom testID', () => {
    render(<ErrorDisplay message="Error" testID="custom-error" />);
    
    expect(screen.getByTestId('custom-error')).toBeTruthy();
  });

  it('retry button uses correct testID', () => {
    render(<ErrorDisplay message="Error" onRetry={() => {}} testID="my-error" />);
    
    expect(screen.getByTestId('my-error-retry')).toBeTruthy();
  });
});
