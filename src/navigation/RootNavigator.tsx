/**
 * RootNavigator
 * 
 * The top-level navigator that switches between Auth and App stacks
 * based on authentication state.
 * 
 * Architecture:
 * ┌─────────────────────────────────────────┐
 * │           RootNavigator                 │
 * │  ┌─────────────┐  ┌─────────────────┐   │
 * │  │AuthNavigator│  │  AppNavigator   │   │
 * │  │ - Login     │  │  - Feed         │   │
 * │  │ - Signup    │  │  - Article      │   │
 * │  └─────────────┘  └─────────────────┘   │
 * │        ↑                  ↑             │
 * │        └──── auth state ──┘             │
 * └─────────────────────────────────────────┘
 * 
 * How it works:
 * 1. On mount, we check if there's an existing session
 * 2. We subscribe to auth state changes (sign in, sign out, token refresh)
 * 3. Based on whether a user exists, we render Auth or App navigator
 * 4. Navigation state resets automatically when switching stacks
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { User } from '@supabase/supabase-js';

import { supabase } from '../services';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

/**
 * Loading screen shown while checking initial auth state.
 * 
 * Why show a loading screen?
 * - Prevents flash of wrong navigator
 * - User sees app is working, not broken
 * - Allows time to check persisted session
 */
function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

export function RootNavigator() {
  // null = still loading, undefined = no user, User = signed in
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Check for existing session on app launch.
     * 
     * Supabase persists sessions in secure storage.
     * This retrieves any existing session so users stay signed in.
     */
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getInitialSession();

    /**
     * Subscribe to auth state changes.
     * 
     * This listener fires when:
     * - User signs in (SIGNED_IN)
     * - User signs out (SIGNED_OUT)
     * - Token is refreshed (TOKEN_REFRESHED)
     * - User is deleted (USER_DELETED)
     * 
     * By updating the user state, we trigger a re-render
     * which automatically switches between Auth and App navigators.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while checking initial auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
