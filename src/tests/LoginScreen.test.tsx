/**
 * LoginScreen Tests
 * 
 * Tests the login form UI and interaction with the auth service.
 * 
 * Test Categories:
 * 1. Rendering — UI elements appear correctly
 * 2. Interaction — User can type and submit
 * 3. Success flow — Successful login behavior
 * 4. Error handling — Errors display correctly
 * 5. Loading state — Button disabled during request
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../screens/LoginScreen';
import * as authService from '../services/auth';

// Mock the auth service
jest.mock('../services/auth');
const mockSignIn = authService.signIn as jest.MockedFunction<typeof authService.signIn>;

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
} as any;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the login form correctly', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      // Check header
      expect(screen.getByText('Welcome Back')).toBeTruthy();
      expect(screen.getByText('Sign in to continue')).toBeTruthy();

      // Check form elements
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();
      expect(screen.getByTestId('login-button')).toBeTruthy();
      expect(screen.getByTestId('signup-link')).toBeTruthy();
    });

    it('shows placeholders for inputs', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
      expect(screen.getByPlaceholderText('Your password')).toBeTruthy();
    });

    it('shows input labels', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('allows typing in email input', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      const emailInput = screen.getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('allows typing in password input', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      const passwordInput = screen.getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'mypassword');

      expect(passwordInput.props.value).toBe('mypassword');
    });

    it('navigates to Signup when link is pressed', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.press(screen.getByTestId('signup-link'));

      expect(mockNavigate).toHaveBeenCalledWith('Signup');
    });
  });

  describe('Button State', () => {
    it('disables login button when email is empty', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      const passwordInput = screen.getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'password123');

      const button = screen.getByTestId('login-button');
      // Button should be disabled (accessibilityState.disabled or we check if onPress works)
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('disables login button when password is empty', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      const emailInput = screen.getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');

      const button = screen.getByTestId('login-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables login button when both fields are filled', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const button = screen.getByTestId('login-button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });
  });

  describe('Successful Login', () => {
    it('calls signIn with email and password', async () => {
      mockSignIn.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } as any },
        error: null,
      });

      render(<LoginScreen navigation={mockNavigation} />);

      // Fill in the form
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      // Submit
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('does not show error on successful login', async () => {
      mockSignIn.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } as any },
        error: null,
      });

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // No error should be displayed
      expect(screen.queryByTestId('error-message')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails', async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { code: 'wrong_password', message: 'Incorrect email or password.' },
      });

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
        expect(screen.getByText('Incorrect email or password.')).toBeTruthy();
      });
    });

    it('displays validation error for invalid email', async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { code: 'invalid_email', message: 'Please enter a valid email address.' },
      });

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'notanemail');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
      });
    });

    it('clears error when user submits again', async () => {
      // First call fails
      mockSignIn.mockResolvedValueOnce({
        data: null,
        error: { code: 'wrong_password', message: 'Incorrect email or password.' },
      });

      // Second call succeeds
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: '123' } as any },
        error: null,
      });

      render(<LoginScreen navigation={mockNavigation} />);

      // First attempt
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeTruthy();
      });

      // Second attempt
      fireEvent.changeText(screen.getByTestId('password-input'), 'correctpassword');
      fireEvent.press(screen.getByTestId('login-button'));

      // Error should be cleared during the request
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).toBeNull();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while signing in', async () => {
      // Make signIn hang to test loading state
      let resolveSignIn: (value: any) => void;
      mockSignIn.mockImplementation(() => new Promise((resolve) => {
        resolveSignIn = resolve;
      }));

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      // Button should show loading state
      await waitFor(() => {
        const button = screen.getByTestId('login-button');
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });

      // Resolve the promise to clean up
      resolveSignIn!({ data: { user: {} }, error: null });
    });

    it('disables inputs while loading', async () => {
      let resolveSignIn: (value: any) => void;
      mockSignIn.mockImplementation(() => new Promise((resolve) => {
        resolveSignIn = resolve;
      }));

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        expect(emailInput.props.editable).toBe(false);
        expect(passwordInput.props.editable).toBe(false);
      });

      resolveSignIn!({ data: { user: {} }, error: null });
    });

    it('re-enables button after login completes', async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { code: 'wrong_password', message: 'Wrong password' },
      });

      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        const button = screen.getByTestId('login-button');
        // After error, button should be re-enabled
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });
});
