/**
 * Authentication Service
 * 
 * A clean wrapper around Supabase Auth that:
 * - Provides a simple, consistent API
 * - Normalizes error messages for user display
 * - Handles edge cases (network errors, invalid tokens, etc.)
 * 
 * Design Decisions:
 * 1. Return Result objects instead of throwing errors
 *    → Easier to handle in UI, no try/catch needed
 * 2. Normalize error messages
 *    → User-friendly messages instead of technical jargon
 * 3. No UI logic
 *    → Service is reusable across different UI implementations
 */

import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Represents a successful operation result.
 * 
 * Why this pattern?
 * Instead of: try { result = await fn() } catch { handle error }
 * We use:     const { data, error } = await fn()
 * 
 * Benefits:
 * - Forces error handling (can't forget to catch)
 * - TypeScript knows data is defined when error is null
 * - Consistent pattern across all async operations
 */
export type AuthResult<T> = 
  | { data: T; error: null }
  | { data: null; error: AuthError };

/**
 * Normalized error object for auth operations.
 * 
 * Why normalize?
 * Supabase returns various error formats. We standardize them so the UI
 * always knows what to expect: a code for logic, a message for display.
 */
export interface AuthError {
  /** Machine-readable error code for conditional logic */
  code: AuthErrorCode;
  /** Human-readable message safe to show users */
  message: string;
}

/**
 * All possible auth error codes.
 * 
 * Using a union type instead of string gives us:
 * - Autocomplete in switch statements
 * - Compile-time errors if we miss a case
 * - Documentation of all possible errors
 */
export type AuthErrorCode =
  | 'invalid_email'
  | 'invalid_password'
  | 'email_taken'
  | 'user_not_found'
  | 'wrong_password'
  | 'too_many_requests'
  | 'network_error'
  | 'unknown_error';

/**
 * Maps Supabase error messages to normalized error codes and messages.
 * 
 * Supabase errors come as strings in various formats. This function
 * detects patterns and returns consistent, user-friendly errors.
 */
function normalizeAuthError(error: { message: string; status?: number }): AuthError {
  const msg = error.message.toLowerCase();

  // Email validation errors
  if (msg.includes('invalid email') || msg.includes('valid email')) {
    return {
      code: 'invalid_email',
      message: 'Please enter a valid email address.',
    };
  }

  // Password validation errors
  if (msg.includes('password') && (msg.includes('least') || msg.includes('short') || msg.includes('weak'))) {
    return {
      code: 'invalid_password',
      message: 'Password must be at least 6 characters long.',
    };
  }

  // Email already registered
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
    return {
      code: 'email_taken',
      message: 'An account with this email already exists.',
    };
  }

  // User not found (sign in)
  if (msg.includes('user not found') || msg.includes('no user')) {
    return {
      code: 'user_not_found',
      message: 'No account found with this email.',
    };
  }

  // Invalid credentials (wrong password)
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
    return {
      code: 'wrong_password',
      message: 'Incorrect email or password.',
    };
  }

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('too many') || error.status === 429) {
    return {
      code: 'too_many_requests',
      message: 'Too many attempts. Please wait a moment and try again.',
    };
  }

  // Network errors
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return {
      code: 'network_error',
      message: 'Unable to connect. Please check your internet connection.',
    };
  }

  // Fallback for unknown errors
  return {
    code: 'unknown_error',
    message: 'Something went wrong. Please try again.',
  };
}

/**
 * Creates a new user account with email and password.
 * 
 * @param email - User's email address
 * @param password - User's chosen password (min 6 characters)
 * @returns The created user or an error
 * 
 * @example
 * const { data, error } = await signUp('user@example.com', 'password123');
 * if (error) {
 *   showToast(error.message);
 *   return;
 * }
 * // data.user is now available
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<{ user: User }>> {
  // Client-side validation for better UX
  if (!email || !email.includes('@')) {
    return {
      data: null,
      error: { code: 'invalid_email', message: 'Please enter a valid email address.' },
    };
  }

  if (!password || password.length < 6) {
    return {
      data: null,
      error: { code: 'invalid_password', message: 'Password must be at least 6 characters long.' },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { data: null, error: normalizeAuthError(error) };
  }

  if (!data.user) {
    return {
      data: null,
      error: { code: 'unknown_error', message: 'Account created but user data unavailable.' },
    };
  }

  return { data: { user: data.user }, error: null };
}

/**
 * Signs in an existing user with email and password.
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns The signed-in user or an error
 * 
 * @example
 * const { data, error } = await signIn('user@example.com', 'password123');
 * if (error) {
 *   if (error.code === 'wrong_password') {
 *     showForgotPasswordLink();
 *   }
 *   showToast(error.message);
 *   return;
 * }
 * // User is now signed in
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ user: User }>> {
  // Client-side validation
  if (!email || !email.includes('@')) {
    return {
      data: null,
      error: { code: 'invalid_email', message: 'Please enter a valid email address.' },
    };
  }

  if (!password) {
    return {
      data: null,
      error: { code: 'invalid_password', message: 'Please enter your password.' },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { data: null, error: normalizeAuthError(error) };
  }

  if (!data.user) {
    return {
      data: null,
      error: { code: 'unknown_error', message: 'Sign in succeeded but user data unavailable.' },
    };
  }

  return { data: { user: data.user }, error: null };
}

/**
 * Signs out the current user.
 * 
 * Clears the session from local storage and invalidates the refresh token.
 * 
 * @returns Success or an error
 * 
 * @example
 * const { error } = await signOut();
 * if (error) {
 *   showToast(error.message);
 *   return;
 * }
 * navigation.reset({ routes: [{ name: 'Login' }] });
 */
export async function signOut(): Promise<AuthResult<null>> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { data: null, error: normalizeAuthError(error) };
  }

  return { data: null, error: null };
}

/**
 * Gets the currently signed-in user.
 * 
 * Returns null if no user is signed in (not an error condition).
 * 
 * @returns The current user or null
 * 
 * @example
 * const { data, error } = await getCurrentUser();
 * if (error) {
 *   // Actual error occurred (network, etc.)
 *   showToast(error.message);
 *   return;
 * }
 * if (!data.user) {
 *   // No user signed in — redirect to login
 *   navigation.navigate('Login');
 *   return;
 * }
 * // data.user is the current user
 */
export async function getCurrentUser(): Promise<AuthResult<{ user: User | null }>> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // "Auth session missing" is not an error — it means no user is signed in
    if (error.message.toLowerCase().includes('session') || 
        error.message.toLowerCase().includes('not authenticated')) {
      return { data: { user: null }, error: null };
    }
    return { data: null, error: normalizeAuthError(error) };
  }

  return { data: { user: data.user }, error: null };
}
