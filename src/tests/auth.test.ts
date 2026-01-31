/**
 * Authentication Service Tests
 * 
 * These tests verify the auth service behavior by mocking Supabase responses.
 * 
 * Testing Strategy:
 * 1. Mock the Supabase client at the module level
 * 2. Configure mock responses for each test case
 * 3. Verify the service returns correct normalized data/errors
 * 
 * Why mock Supabase?
 * - Tests run fast (no network calls)
 * - Tests are deterministic (same result every time)
 * - We can simulate error conditions easily
 * - No need for a real Supabase project
 */

import { signUp, signIn, signOut, getCurrentUser } from '../services/auth';

/**
 * Mock the entire supabase module.
 * 
 * jest.mock() hoists to the top of the file, so it runs before imports.
 * We return an object that mimics the supabase client structure.
 */
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetUser = jest.fn();

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

/**
 * Reset mocks before each test to ensure isolation.
 * This prevents test pollution where one test's setup affects another.
 */
beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Helper to create a mock User object.
 * Supabase User has many fields — we only include what our tests need.
 */
const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('signUp', () => {
  it('returns user data on successful sign up', async () => {
    const mockUser = createMockUser();
    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const result = await signUp('test@example.com', 'password123');

    expect(result.error).toBeNull();
    expect(result.data?.user).toEqual(mockUser);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('normalizes email to lowercase', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: createMockUser(), session: {} },
      error: null,
    });

    await signUp('TEST@EXAMPLE.COM', 'password123');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('trims whitespace from email', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: createMockUser(), session: {} },
      error: null,
    });

    await signUp('  test@example.com  ', 'password123');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('returns invalid_email error for empty email', async () => {
    const result = await signUp('', 'password123');

    expect(result.error?.code).toBe('invalid_email');
    expect(result.error?.message).toContain('valid email');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns invalid_email error for email without @', async () => {
    const result = await signUp('notanemail', 'password123');

    expect(result.error?.code).toBe('invalid_email');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns invalid_password error for short password', async () => {
    const result = await signUp('test@example.com', '12345');

    expect(result.error?.code).toBe('invalid_password');
    expect(result.error?.message).toContain('6 characters');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns invalid_password error for empty password', async () => {
    const result = await signUp('test@example.com', '');

    expect(result.error?.code).toBe('invalid_password');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns email_taken error when email already registered', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    const result = await signUp('existing@example.com', 'password123');

    expect(result.error?.code).toBe('email_taken');
    expect(result.error?.message).toContain('already exists');
  });

  it('returns normalized error for rate limiting', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Rate limit exceeded', status: 429 },
    });

    const result = await signUp('test@example.com', 'password123');

    expect(result.error?.code).toBe('too_many_requests');
    expect(result.error?.message).toContain('Too many attempts');
  });
});

describe('signIn', () => {
  it('returns user data on successful sign in', async () => {
    const mockUser = createMockUser();
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const result = await signIn('test@example.com', 'password123');

    expect(result.error).toBeNull();
    expect(result.data?.user).toEqual(mockUser);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('returns invalid_email error for empty email', async () => {
    const result = await signIn('', 'password123');

    expect(result.error?.code).toBe('invalid_email');
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('returns invalid_password error for empty password', async () => {
    const result = await signIn('test@example.com', '');

    expect(result.error?.code).toBe('invalid_password');
    expect(result.error?.message).toContain('enter your password');
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('returns wrong_password error for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const result = await signIn('test@example.com', 'wrongpassword');

    expect(result.error?.code).toBe('wrong_password');
    expect(result.error?.message).toContain('Incorrect email or password');
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: createMockUser(), session: {} },
      error: null,
    });

    await signIn('  TEST@EXAMPLE.COM  ', 'password123');

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

describe('signOut', () => {
  it('returns success on successful sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const result = await signOut();

    expect(result.error).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('returns normalized error on sign out failure', async () => {
    mockSignOut.mockResolvedValue({
      error: { message: 'Network request failed' },
    });

    const result = await signOut();

    expect(result.error?.code).toBe('network_error');
    expect(result.error?.message).toContain('internet connection');
  });
});

describe('getCurrentUser', () => {
  it('returns user when signed in', async () => {
    const mockUser = createMockUser();
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await getCurrentUser();

    expect(result.error).toBeNull();
    expect(result.data?.user).toEqual(mockUser);
  });

  it('returns null user when not signed in (session missing)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing!' },
    });

    const result = await getCurrentUser();

    // No error — this is expected behavior, not an error condition
    expect(result.error).toBeNull();
    expect(result.data?.user).toBeNull();
  });

  it('returns null user when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'User not authenticated' },
    });

    const result = await getCurrentUser();

    expect(result.error).toBeNull();
    expect(result.data?.user).toBeNull();
  });

  it('returns error for actual failures', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Network request failed' },
    });

    const result = await getCurrentUser();

    expect(result.error?.code).toBe('network_error');
    expect(result.data).toBeNull();
  });
});

describe('error normalization', () => {
  /**
   * These tests verify that various Supabase error messages
   * are correctly mapped to our normalized error codes.
   */
  
  it('normalizes "User already registered" to email_taken', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const result = await signUp('test@example.com', 'password123');
    expect(result.error?.code).toBe('email_taken');
  });

  it('normalizes "duplicate key" to email_taken', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'duplicate key value violates unique constraint' },
    });

    const result = await signUp('test@example.com', 'password123');
    expect(result.error?.code).toBe('email_taken');
  });

  it('normalizes password requirement errors', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Password should be at least 6 characters' },
    });

    const result = await signUp('test@example.com', 'password123');
    expect(result.error?.code).toBe('invalid_password');
  });

  it('normalizes fetch errors to network_error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'FetchError: request failed' },
    });

    const result = await signIn('test@example.com', 'password123');
    expect(result.error?.code).toBe('network_error');
  });

  it('returns unknown_error for unrecognized errors', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Some weird error we never seen' },
    });

    const result = await signIn('test@example.com', 'password123');
    expect(result.error?.code).toBe('unknown_error');
    expect(result.error?.message).toBe('Something went wrong. Please try again.');
  });
});
