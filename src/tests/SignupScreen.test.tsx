/**
 * SignupScreen Tests
 * 
 * Tests the signup form UI, validation, and auth service integration.
 * 
 * Test Categories:
 * 1. Rendering — UI elements appear correctly
 * 2. Form Interaction — User can type and navigate
 * 3. Validation — Password requirements and matching
 * 4. Successful Signup — Account creation flow
 * 5. Error Handling — Errors display correctly
 * 6. Loading State — Button and inputs during request
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SignupScreen } from '../screens/SignupScreen';
import * as authService from '../services/auth';

// Mock the auth service
jest.mock('../services/auth');
const mockSignUp = authService.signUp as jest.MockedFunction<typeof authService.signUp>;

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
} as any;

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the signup form correctly', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      // Check header (use getAllByText since "Create Account" appears in header and button)
      expect(screen.getAllByText('Create Account').length).toBeGreaterThan(0);
      expect(screen.getByText('Join MatBrief today')).toBeTruthy();

      // Check form elements
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();
      expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
      expect(screen.getByTestId('signup-button')).toBeTruthy();
      expect(screen.getByTestId('login-link')).toBeTruthy();
    });

    it('shows placeholders for inputs', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
      expect(screen.getByPlaceholderText('At least 6 characters')).toBeTruthy();
      expect(screen.getByPlaceholderText('Re-enter your password')).toBeTruthy();
    });

    it('shows input labels', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('Password')).toBeTruthy();
      expect(screen.getByText('Confirm Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('allows typing in all inputs', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmInput = screen.getByTestId('confirm-password-input');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmInput, 'password123');

      expect(emailInput.props.value).toBe('test@example.com');
      expect(passwordInput.props.value).toBe('password123');
      expect(confirmInput.props.value).toBe('password123');
    });

    it('navigates to Login when link is pressed', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.press(screen.getByTestId('login-link'));

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Button State', () => {
    it('disables signup button when email is empty', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');

      const button = screen.getByTestId('signup-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables signup button when password is empty', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');

      const button = screen.getByTestId('signup-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables signup button when confirm password is empty', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      const button = screen.getByTestId('signup-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables signup button when all fields are filled', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');

      const button = screen.getByTestId('signup-button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('shows hint when password is too short', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('password-input'), 'abc');

      expect(screen.getByTestId('password-hint')).toBeTruthy();
      expect(screen.getByText('3 more characters needed')).toBeTruthy();
    });

    it('hides hint when password meets minimum length', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('password-input'), 'abcdef');

      expect(screen.queryByTestId('password-hint')).toBeNull();
    });

    it('shows error when passwords do not match', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'different');

      expect(screen.getByTestId('password-mismatch-hint')).toBeTruthy();
      expect(screen.getByText('Passwords do not match')).toBeTruthy();
    });

    it('hides mismatch error when passwords match', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');

      expect(screen.queryByTestId('password-mismatch-hint')).toBeNull();
    });

    it('shows validation error on submit if password too short', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'abc');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'abc');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
      });

      // Should NOT call signUp
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('shows validation error on submit if passwords do not match', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'different123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('Passwords do not match.')).toBeTruthy();
      });

      // Should NOT call signUp
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('shows validation error on submit if email is invalid', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'notanemail');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Successful Signup', () => {
    it('calls signUp with email and password when validation passes', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } as any },
        error: null,
      });

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('does not show error on successful signup', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } as any },
        error: null,
      });

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('error-message')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when signup fails', async () => {
      mockSignUp.mockResolvedValue({
        data: null,
        error: { code: 'email_taken', message: 'An account with this email already exists.' },
      });

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'existing@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('An account with this email already exists.')).toBeTruthy();
      });
    });

    it('clears error when user submits again', async () => {
      // First call fails
      mockSignUp.mockResolvedValueOnce({
        data: null,
        error: { code: 'email_taken', message: 'Email already exists.' },
      });

      // Second call succeeds
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123' } as any },
        error: null,
      });

      render(<SignupScreen navigation={mockNavigation} />);

      // First attempt
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
      });

      // Second attempt with different email
      fireEvent.changeText(screen.getByTestId('email-input'), 'new@example.com');
      fireEvent.press(screen.getByTestId('signup-button'));

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeNull();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while signing up', async () => {
      let resolveSignUp: (value: any) => void;
      mockSignUp.mockImplementation(() => new Promise((resolve) => {
        resolveSignUp = resolve;
      }));

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        const button = screen.getByTestId('signup-button');
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });

      resolveSignUp!({ data: { user: {} }, error: null });
    });

    it('disables inputs while loading', async () => {
      let resolveSignUp: (value: any) => void;
      mockSignUp.mockImplementation(() => new Promise((resolve) => {
        resolveSignUp = resolve;
      }));

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('email-input').props.editable).toBe(false);
        expect(screen.getByTestId('password-input').props.editable).toBe(false);
        expect(screen.getByTestId('confirm-password-input').props.editable).toBe(false);
      });

      resolveSignUp!({ data: { user: {} }, error: null });
    });

    it('re-enables button after signup completes with error', async () => {
      mockSignUp.mockResolvedValue({
        data: null,
        error: { code: 'email_taken', message: 'Email exists' },
      });

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        const button = screen.getByTestId('signup-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Network Error Handling', () => {
    it('displays network error when signUp throws', async () => {
      // Simulate a network failure by rejecting the promise
      mockSignUp.mockRejectedValue(new Error('Network request failed'));

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('Unable to connect. Please check your internet connection.')).toBeTruthy();
      });
    });

    it('re-enables form after network error', async () => {
      mockSignUp.mockRejectedValue(new Error('Network request failed'));

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(screen.getByTestId('signup-button'));

      await waitFor(() => {
        const button = screen.getByTestId('signup-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
        
        const emailInput = screen.getByTestId('email-input');
        expect(emailInput.props.editable).toBe(true);
      });
    });

    it('allows retry after network error', async () => {
      // First call fails with network error
      mockSignUp.mockRejectedValueOnce(new Error('Network request failed'));
      // Second call succeeds
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123' } as any },
        error: null,
      });

      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
      
      // First attempt - network error
      fireEvent.press(screen.getByTestId('signup-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Unable to connect. Please check your internet connection.')).toBeTruthy();
      });

      // Second attempt - success
      fireEvent.press(screen.getByTestId('signup-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeNull();
      });
    });
  });
});
