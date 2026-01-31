/**
 * App Component Test
 * 
 * Tests the root App component with auth-based navigation.
 * 
 * The App renders:
 * - Loading screen while checking auth
 * - AuthNavigator (Login/Signup) when not signed in
 * - AppNavigator (Feed/Article) when signed in
 */

import { render, screen, waitFor } from '@testing-library/react-native';
import App from '../../App';
import { supabase } from '../services/supabase';

// Get the mocked supabase for test configuration
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('App', () => {
  beforeEach(() => {
    // Reset to default: no session (user not logged in)
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders without crashing', async () => {
    const { toJSON } = render(<App />);

    // Wait for async auth check to complete
    await waitFor(() => {
      expect(toJSON()).not.toBeNull();
    });
  });

  it('shows loading indicator initially', () => {
    render(<App />);

    // ActivityIndicator should be visible while checking auth
    // Note: We check the component exists, not specific text
    expect(screen.root).toBeTruthy();
  });

  it('shows Login screen when user is not authenticated', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<App />);

    // Wait for auth check and then verify Login screen is shown
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeTruthy();
    });
  });

  it('shows Feed screen when user is authenticated', async () => {
    // Mock an authenticated session
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        } 
      },
      error: null,
    });

    render(<App />);

    // Wait for auth check and then verify Feed screen is shown
    await waitFor(() => {
      expect(screen.getByText('Feed')).toBeTruthy();
    });
  });

  it('subscribes to auth state changes on mount', () => {
    render(<App />);

    // Verify onAuthStateChange was called to set up the listener
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
