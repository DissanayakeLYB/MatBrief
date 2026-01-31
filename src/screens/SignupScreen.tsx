/**
 * SignupScreen
 * 
 * Allows new users to create an account.
 * 
 * Features:
 * - Email input
 * - Password input with minimum length validation
 * - Confirm password with match validation
 * - Loading state while creating account
 * - Clear error messages
 * - Link to login for existing users
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { signUp } from '../services';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
};

/**
 * Minimum password length requirement.
 * Matches the validation in authService.signUp.
 */
const MIN_PASSWORD_LENGTH = 6;

export function SignupScreen({ navigation }: SignupScreenProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate the form before submission.
   * Returns an error message if validation fails, null if valid.
   * 
   * We validate on the client for instant feedback, but the server
   * also validates (defense in depth).
   */
  const validateForm = (): string | null => {
    // Check email format (basic check, server does full validation)
    if (!email.trim() || !email.includes('@')) {
      return 'Please enter a valid email address.';
    }

    // Check password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  /**
   * Handle signup button press.
   * 
   * Flow:
   * 1. Validate form (client-side)
   * 2. Clear any previous errors
   * 3. Set loading state
   * 4. Call auth service
   * 5. If error, display it
   * 6. If success, RootNavigator auto-switches to AppNavigator
   */
  const handleSignup = async () => {
    // Client-side validation first
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear previous error and start loading
    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Success! RootNavigator will automatically switch to AppNavigator
      // because it's listening to auth state changes.
    } catch (err) {
      // Handle unexpected errors (network failure, etc.)
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Determine if the signup button should be disabled.
   * Disabled when loading or when required inputs are empty.
   */
  const isButtonDisabled =
    isLoading || !email.trim() || !password || !confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MatBrief today</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer} testID="error-message">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                editable={!isLoading}
                testID="email-input"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                editable={!isLoading}
                testID="password-input"
              />
              {/* Password strength hint */}
              {password.length > 0 && password.length < MIN_PASSWORD_LENGTH && (
                <Text style={styles.hint} testID="password-hint">
                  {MIN_PASSWORD_LENGTH - password.length} more characters needed
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  // Show visual feedback when passwords don't match
                  confirmPassword.length > 0 &&
                    password !== confirmPassword &&
                    styles.inputError,
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                editable={!isLoading}
                testID="confirm-password-input"
              />
              {/* Password match feedback */}
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.hintError} testID="password-mismatch-hint">
                  Passwords do not match
                </Text>
              )}
            </View>

            {/* Signup Button */}
            <Pressable
              style={[
                styles.button,
                isButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isButtonDisabled}
              testID="signup-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <Pressable
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
            testID="login-link"
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkTextBold}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  hintError: {
    fontSize: 12,
    color: '#f87171',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: '#1e40af',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  linkText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
