/**
 * LoginScreen
 * 
 * Allows existing users to sign in to their account.
 * 
 * Features:
 * - Email and password inputs with validation
 * - Loading state while authenticating
 * - Clear error messages
 * - Link to signup for new users
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
import { signIn } from '../services';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle login button press.
   * 
   * Flow:
   * 1. Clear any previous errors
   * 2. Set loading state (disables button, shows spinner)
   * 3. Call auth service
   * 4. If error, display it
   * 5. If success, RootNavigator auto-switches to AppNavigator
   */
  const handleLogin = async () => {
    // Clear previous error
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }
      
      // Success! RootNavigator will automatically switch to AppNavigator
      // because it's listening to auth state changes.
      // No manual navigation needed here.
    } catch (err) {
      // Handle unexpected errors (network failure, etc.)
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Determine if the login button should be disabled.
   * Disabled when loading or when inputs are empty.
   */
  const isButtonDisabled = isLoading || !email.trim() || !password;

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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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
                placeholder="Your password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                editable={!isLoading}
                testID="password-input"
              />
            </View>

            {/* Login Button */}
            <Pressable
              style={[
                styles.button,
                isButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isButtonDisabled}
              testID="login-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          {/* Signup Link */}
          <Pressable
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
            testID="signup-link"
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkTextBold}>Sign up</Text>
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
